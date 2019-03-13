import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import sass from "gulp-sass";
import normalize from "node-normalize-scss";
import cssmin from "gulp-cssmin";
import browserify from "browserify";
import babel from "babelify";
import uglify from "gulp-uglify";
import inject from "gulp-inject";
import tap from "gulp-tap";
import buffer from "gulp-buffer";
import del from "del";
import connect from "gulp-connect";

const SRC_FOLDER_NAME = "src";
const DIST_FOLDER_NAME = "dist";

const paths = {
  views: {
    src: SRC_FOLDER_NAME + "/views/**/*.html",
    dest: DIST_FOLDER_NAME,
    styles: DIST_FOLDER_NAME + "/styles/index.css",
    scripts: DIST_FOLDER_NAME + "/scripts/index.js"
  },
  styles: {
    src: SRC_FOLDER_NAME + "/styles/index.scss",
    dest: DIST_FOLDER_NAME + "/styles/"
  },
  scripts: {
    src: SRC_FOLDER_NAME + "/scripts/index.js",
    dest: DIST_FOLDER_NAME + "/scripts/"
  }
};

export function clean() {
  return del([DIST_FOLDER_NAME]);
}

export function views() {
  return gulp
    .src(paths.views.src)
    .pipe(
      inject(
        gulp.src([paths.views.styles, paths.views.scripts], { read: false }),
        { ignorePath: DIST_FOLDER_NAME }
      )
    )
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.views.dest));
}

export function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(
      sass({
        includePaths: normalize.includePaths
      })
    )
    .pipe(cssmin({ keepSpecialComments: 0 }))
    .pipe(gulp.dest(paths.styles.dest));
}

export function scripts() {
  return gulp
    .src(paths.scripts.src, { read: false })
    .pipe(
      tap(function(file) {
        file.contents = browserify(file.path)
          .transform(babel)
          .bundle();
      })
    )
    .pipe(buffer())
    .pipe(
      uglify({
        compress: {
          drop_console: true
        }
      })
    )
    .pipe(gulp.dest(paths.scripts.dest));
}

export function server() {
  connect.server({
    root: DIST_FOLDER_NAME,
    livereload: true
  });
}

export function reload() {
  gulp.watch(paths.views.src, views);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
}

export const build = gulp.series(clean, gulp.parallel(styles, scripts), views);
export const dev = gulp.series(build, gulp.parallel(server, reload));
