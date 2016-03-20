import gulp from 'gulp';
import gutil from 'gutil';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import path from 'path';
import schema from 'gulp-graphql';

import webPackConfig from './webpack.config';

let webpackCompiler, webpackWatcher, devServer;
const isDevelopmentEnv = process.env.NODE_ENV === 'development';
const hotReloading = !!isDevelopmentEnv;

function updateWatch() {
  if (webpackWatcher) {
    webpackWatcher.close();
  }

  webpackCompiler = webpackCompiler || webpack(webPackConfig);

  webpackWatcher = webpackCompiler.watch({
    aggregateTimeout: 300,
    poll: false
  }, function(err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    }

    gutil.log("[webpack]", stats.toString({
        timings: true,
        modules: false,
        assets: false,
        chunks: false,
        chunkModules: false,
        children: false,
        cached: false,
        source: false
    }));
  });
}

function updateHMRServer() {
  if (devServer) {
     devServer.close();
  } else {
     devServer= new WebpackDevServer(webpack(webPackConfig), {
       publicPath: webPackConfig.output.publicPath,
       hot: true,
       historyApiFallback: true
     });
  }

  devServer.listen(3000, 'localhost', function (err, result) {
    if (err) {
      return console.log(err);
    }

    console.log('Listening at http://localhost:3000/');
  });
}

const genSchemaCbk = hotReloading ? updateHMRServer : updateWatch;
gulp.task('webpack-watch-update', ['generate-schema'], genSchemaCbk);

// Regenerate the graphql schema and recompile the frontend code that relies on schema.json
gulp.task('generate-schema', () => {
  return gulp.src('./src/data/schema.js')
    .pipe(schema({
      json: true,
      graphql: true
    }))
    .on('error', err => {
      console.error(err.message);
      console.error(err.stack);
    })
    .pipe(gulp.dest('./src/data'));
});

gulp.task('watch-schema', ['generate-schema'], () => {
  gulp.watch(path.join(__dirname, './src/data', '**/*.js'), ['webpack-watch-update']);
});

gulp.task('webpack', ['webpack-watch-update', 'watch-schema']);

gulp.task('default', ['webpack']);
