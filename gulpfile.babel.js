import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import sass from "gulp-sass";
import normalize from "node-normalize-scss";
import cssmin from "gulp-cssmin";
import base64 from "gulp-css-base64";
import browserify from "browserify";
import babel from "babelify";
import uglify from "gulp-uglify";
import inject from "gulp-inject";
import tap from "gulp-tap";
import buffer from "gulp-buffer";
import del from "del";
import connect from "gulp-connect";
import filterSize from "gulp-filter-size";
import cssUrlAdjuster from "gulp-css-url-adjuster";
import autoprefixer from "gulp-autoprefixer";

const SRC_FOLDER_NAME = "src";
const DIST_FOLDER_NAME = "dist";
const BASE64_MAX_SIZE = 32768;

const paths = {
  views: {
    src: SRC_FOLDER_NAME + "/views/**/*.html",
    dest: DIST_FOLDER_NAME,
    styles: DIST_FOLDER_NAME + "/styles/index.css",
    scripts: DIST_FOLDER_NAME + "/scripts/index.js"
  },
  styles: {
    src: SRC_FOLDER_NAME + "/styles/index.scss",
    dest: DIST_FOLDER_NAME + "/styles/",
    watch: SRC_FOLDER_NAME + "/styles/**/*.scss"
  },
  scripts: {
    src: SRC_FOLDER_NAME + "/scripts/index.js",
    dest: DIST_FOLDER_NAME + "/scripts/",
    watch: SRC_FOLDER_NAME + "/scripts/**/*.js"
  },
  fonts: {
    src: SRC_FOLDER_NAME + "/fonts/**/*.*",
    dest: DIST_FOLDER_NAME + "/fonts/"
  },
  images: {
    src: SRC_FOLDER_NAME + "/images/**/*.*",
    dest: DIST_FOLDER_NAME + "/images/"
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
        { ignorePath: DIST_FOLDER_NAME, addRootSlash: false }
      )
    )
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.views.dest))
    .pipe(connect.reload());
}

export function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(
      sass({
        includePaths: normalize.includePaths
      })
    )
    .pipe(
      base64({
        baseDir: SRC_FOLDER_NAME,
        extensionsAllowed: [".jpg", ".svg", ".png", ".woff2", ".woff"],
        maxWeightResource: BASE64_MAX_SIZE
      })
    )
    .pipe(
      cssUrlAdjuster({
        prepend: ".."
      })
    )
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(cssmin({ keepSpecialComments: 0 }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(connect.reload());
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
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(connect.reload());
}

export function server() {
  connect.server({
    root: DIST_FOLDER_NAME,
    livereload: true
  });
}

export function reload() {
  gulp.watch(paths.views.src, views);
  gulp.watch(paths.scripts.watch, scripts);
  gulp.watch(paths.styles.watch, styles);
}

export function images() {
  return gulp
    .src(paths.images.src)
    .pipe(filterSize({ min: BASE64_MAX_SIZE }))
    .pipe(gulp.dest(paths.images.dest));
}

export function fonts() {
  return gulp
    .src(paths.fonts.src)
    .pipe(filterSize({ min: BASE64_MAX_SIZE }))
    .pipe(gulp.dest(paths.fonts.dest));
}

export const build = gulp.series(
  clean,
  gulp.parallel(styles, scripts, fonts, images),
  views
);
export const dev = gulp.series(build, gulp.parallel(server, reload));
