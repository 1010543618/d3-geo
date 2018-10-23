# 目录树

├─.eslintrc.json【代码检查配置文件】
├─.npmignore【配置上传npm忽略那些文件】
├─d3-geo.sublime-project【sublime编辑器项目配置文件】
├─LICENSE【许可】
├─package.json【！！！项目配置文件】
├─README-ORIGIN.md【！！！原手册】
├─README.md【！！！翻译后手册】
├─rollup.config.js【rollup配置文件】
├─yarn.lock【存储yran依赖信息的文件】
├─test【测试用例，用tape测试】
|  ├─area-test.js
|  ├─bounds-test.js
|  ├─centroid-test.js
|  ├─...
├─src【！！！源码】
|  ├─adder.js
|  ├─area.js
|  ├─bounds.js
|  ├─cartesian.js
|  ├─centroid.js
|  ├─circle.js
|  ├─compose.js
|  ├─constant.js
|  ├─contains.js
|  ├─distance.js
|  ├─graticule.js
|  ├─identity.js
|  ├─index.js
|  ├─interpolate.js
|  ├─length.js
|  ├─math.js
|  ├─noop.js
|  ├─pointEqual.js
|  ├─polygonContains.js
|  ├─rotation.js
|  ├─stream.js
|  ├─transform.js
|  ├─projection
|  |     ├─albers.js
|  |     ├─albersUsa.js
|  |     ├─azimuthal.js
|  |     ├─azimuthalEqualArea.js
|  |     ├─azimuthalEquidistant.js
|  |     ├─conic.js
|  |     ├─conicConformal.js
|  |     ├─conicEqualArea.js
|  |     ├─conicEquidistant.js
|  |     ├─cylindricalEqualArea.js
|  |     ├─equalEarth.js
|  |     ├─equirectangular.js
|  |     ├─fit.js
|  |     ├─gnomonic.js
|  |     ├─identity.js
|  |     ├─index.js
|  |     ├─mercator.js
|  |     ├─naturalEarth1.js
|  |     ├─orthographic.js
|  |     ├─resample.js
|  |     ├─stereographic.js
|  |     └transverseMercator.js
|  ├─path
|  |  ├─area.js
|  |  ├─bounds.js
|  |  ├─centroid.js
|  |  ├─context.js
|  |  ├─index.js
|  |  ├─measure.js
|  |  └string.js
|  ├─clip
|  |  ├─antimeridian.js
|  |  ├─buffer.js
|  |  ├─circle.js
|  |  ├─extent.js
|  |  ├─index.js
|  |  ├─line.js
|  |  ├─rectangle.js
|  |  └rejoin.js
├─img【测试做对比用的标准图片】
|  ├─albers.png
|  ├─albersUsa-parameters.png
|  ├─albersUsa.png
|  ├─angleorient30.png
|  ├─azimuthalEqualArea.png
|  ├─azimuthalEquidistant.png
|  ├─conicConformal.png
|  ├─conicEqualArea.png
|  ├─conicEquidistant.png
|  ├─equalEarth.png
|  ├─equirectangular.png
|  ├─gnomonic.png
|  ├─graticule.png
|  ├─mercator.png
|  ├─naturalEarth1.png
|  ├─orthographic.png
|  ├─stereographic.png
|  └transverseMercator.png
├─dist【发布版（distribution）】
|  ├─d3-geo.js
|  └d3-geo.min.js