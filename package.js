/**
 * 因为json没法写注释，这里就复制出来在js上写注释
 */
!{
  /////////////////
  // 一些基本信息 //
  /////////////////
  "name": "d3-geo",
  "version": "1.11.1",
  "description": "Shapes and calculators for spherical coordinates.",
  "keywords": [
    "d3",
    "d3-module",
    "geo",
    "maps",
    "cartography"
  ],
  "homepage": "https://d3js.org/d3-geo/",
  "license": "BSD-3-Clause",
  "author": {
    "name": "Mike Bostock",
    "url": "https://bost.ocks.org/mike"
  },
  "main": "dist/d3-geo.js",
  "unpkg": "dist/d3-geo.min.js",
  "jsdelivr": "dist/d3-geo.min.js",
  "module": "src/index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/d3/d3-geo.git"
  },
  //////////
  // 脚本 //
  //////////
  "scripts": {
    /**
     * rollup -c：
     *   使用默认配置文件打包
     *   https://www.rollupjs.com/guide/zh#-using-config-files-
     */
    "pretest": "rollup -c",
    /**
     * npm test 前会自动运行 npm run pretest
     * tape 'test/星星/星-test.js'
     *   使用默认配置文件打包
     *   https://www.rollupjs.com/guide/zh#-using-config-files-
     * eslint src
     *   检查语法
     *   https://eslint.org/docs/user-guide/command-line-interface
     */
    "test": "tape 'test/**/*-test.js' && eslint src",
    /**
     * rm -rf dist
     *   删除dist文件夹
     * yarn test
     *   执行上面的test脚本
     * mkdir -p test/output
     *   递归创建目录test/output（-p：parents）
     * test/compare-images
     *   执行shell脚本
     */
    "prepublishOnly": "rm -rf dist && yarn test && mkdir -p test/output && test/compare-images",
    /**
     * git push
     *   推到远程库
     * git push --tags
     *   tags推到远程库
     * cd ../d3.github.com
     *   打开上级目录的d3.github.com
     * git pull
     *   从远程库把代码拉下来
     * cp ../${npm_package_name}/dist/${npm_package_name}.js ${npm_package_name}.v${npm_package_version%%.*}.js
     *   对比d3-geo和d3.github.com的d3-geo文件
     * cp ../${npm_package_name}/dist/${npm_package_name}.min.js ${npm_package_name}.v${npm_package_version%%.*}.min.js
     *   对比d3-geo和d3.github.com的d3-geo.min文件
     * git add ${npm_package_name}.v${npm_package_version%%.*}.js ${npm_package_name}.v${npm_package_version%%.*}.min.js
     * git commit -m \"${npm_package_name} ${npm_package_version}\" 
     * git push 
     *   新的d3-geo和d3-geo.min推到远程库
     * cd -
     *   返回到上一次的工作目录（d3-geo的根目录）
     * zip -j dist/${npm_package_name}.zip -- LICENSE README.md dist/${npm_package_name}.js dist/${npm_package_name}.min.js
     *   许可，手册，源码和压缩后的源码添加到zip（-j 只保存文件名称及其内容，而不存放任何目录名称。）
     */
    "postpublish": "git push && git push --tags && cd ../d3.github.com && git pull && cp ../${npm_package_name}/dist/${npm_package_name}.js ${npm_package_name}.v${npm_package_version%%.*}.js && cp ../${npm_package_name}/dist/${npm_package_name}.min.js ${npm_package_name}.v${npm_package_version%%.*}.min.js && git add ${npm_package_name}.v${npm_package_version%%.*}.js ${npm_package_name}.v${npm_package_version%%.*}.min.js && git commit -m \"${npm_package_name} ${npm_package_version}\" && git push && cd - && zip -j dist/${npm_package_name}.zip -- LICENSE README.md dist/${npm_package_name}.js dist/${npm_package_name}.min.js"
  },
  //////////
  // 依赖 //
  //////////
  "dependencies": {
    "d3-array": "1"
  },
  "devDependencies": {
    "canvas": "1",
    "d3-format": "1",
    "eslint": "5",
    "rollup": "0.64",
    "rollup-plugin-terser": "1",
    "tape": "4",
    "topojson-client": "3",
    "world-atlas": "1"
  }
}
