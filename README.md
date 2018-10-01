# d3-geo

地图投影有时用点转换实现。例如，球形墨卡托（译者注：球形墨卡托是将地球模拟为球形进行投影，常用于Web）：

```js
function mercator(x, y) {
  return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
}
```

如果几何体由无限个连续的点表示，这将是一种合理的*数学*方法。然而，计算机没有无限的内存，所以我们必须使用离散的几何体，如多边形和折线！

离散几何体使得从球体投影到平面变得更加困难。球面上的多边形的边缘是[测地线](https://en.wikipedia.org/wiki/Geodesic)（大圆的一段圆弧），而不是直线。除了[gnomonic](#geoGnomonic)之外的所有地图投影中测地线投影到平面都是曲线，因此精确投影需要沿每个弧插值。D3使用受[矢量曲线数据压缩算法](https://bost.ocks.org/mike/simplify/)启发的[自适应采样](https://bl.ocks.org/mbostock/3795544)来平衡准确性和性能。


多边形和折线的投影还必须处理球体和平面之间的拓扑差异。一些投影需要切割几何体[穿过反面子午线](https://bl.ocks.org/mbostock/3788999)的部分，其他的需要[剪切几何体到大圆](https://bl.ocks.org/mbostock/3021474)。

球面多边形还需要一个[绕序约定](https://bl.ocks.org/mbostock/a7bdfeb041e850799a8d3dce4d8c50c8)来确定多边形的哪一边是内部：小于半球的多边形的外环必须是顺时针的，而[大于半球](https://bl.ocks.org/mbostock/6713736)的多边形的外环必须是逆时针的。代表孔的内圈必须使用其外圈的相反的绕序。此卷绕顺序约定[TopoJSON](https://github.com/topojson)和[ESRI shapefiles](https://github.com/mbostock/shapefile)也在使用；但是，它与GeoJSON的[RFC 7946](https://tools.ietf.org/html/rfc7946#section-3.1.6)**相反**。（另请注意，标准GeoJSON WGS84使用平面等距（equirectangular）坐标，而不是球面坐标，因此可能需要[拼接](https://github.com/d3/d3-geo-projection/blob/master/README.md#geostitch)去除反面子午线切口。）

D3的方法提供了极好的表现力：您可以为数据选择想要的投影和外观。D3支持各种常见和[不常见的地图投影](https://github.com/d3/d3-geo-projection)。更多有关信息，请参阅[The Toolmaker’s Guide](https://vimeo.com/106198518#t=20m0s)的第2部分。

D3使用[GeoJSON](http://geojson.org/geojson-spec.html)在JavaScript中表示地理要素。（另请参阅可以显著压缩并按拓扑结构编码GeoJSON的扩展[TopoJSON](https://github.com/mbostock/topojson)，它更加紧凑并对拓扑进行编码。）要将shapefile转换为GeoJSON，请使用[shp2geo](https://github.com/mbostock/shapefile/blob/master/README.md#shp2geo)，它是[shapefile package](https://github.com/mbostock/shapefile)的一部分。有关d3-geo和相关工具的介绍，请参阅[命令行地图制图](https://medium.com/@mbostock/command-line-cartography-part-1-897aa8f8ca2c)。

## 安装

NPM安装, `npm install d3-geo`，或者[下载最新版本](https://github.com/d3/d3-geo/releases/latest)。您也可以直接从[d3js.org](https://d3js.org)，或着作为[独立库](https://d3js.org/d3-geo.v1.min.js)，或者[D3 4.0](https://github.com/d3/d3)的一部分加载。d3-geo支持AMD、CommonJS、和原生（vanilla）环境。原生环境中使用`d3`作为入口：

```html
<script src="https://d3js.org/d3-array.v1.min.js"></script>
<script src="https://d3js.org/d3-geo.v1.min.js"></script>
<script>

var projection = d3.geoEqualEarth(),
    path = d3.geoPath(projection);

</script>
```
[在浏览器中尝试使用d3-geo。](https://tonicdev.com/npm/d3-geo)

## API 参考

* [Paths](#paths)
* [Projections](#projections) ([Azimuthal](#azimuthal-projections), [Composite](#composite-projections), [Conic](#conic-projections), [Cylindrical](#cylindrical-projections))
* [Raw Projections](#raw-projections)
* [Spherical Math](#spherical-math)
* [Spherical Shapes](#spherical-shapes)
* [Streams](#streams)
* [Transforms](#transforms)
* [Clipping](#clipping)

### Paths

[d3.geoPath](#geoPath)是一个类似形状生成器[d3-shape](https://github.com/d3/d3-shape)的地理路径生成器：它可以由指定GeoJSON几何体或要素对象生成SVG路径数据字符串或[渲染Canvas的路径](https://bl.ocks.org/mbostock/3783604)。动态或交互的投影建议使用Canvas以提高性能。路径可以与[projections](#projections)或者[transforms](#transforms)一起使用，也可以将平面几何体直接渲染到Canvas或SVG。

<a href="#geoPath" name="geoPath">#</a> d3.<b>geoPath</b>([<i>projection</i>[, <i>context</i>]]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

使用默认设置创建新的地理路径生成器。指定*projection*将调用[projection](#path_projection)设置当前投影，指定*context*将调用[context](#path_context)设置当前上下文。

<a href="#_path" name="_path">#</a> <i>path</i>(<i>object</i>[, <i>arguments…</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

渲染指定*object*，可以是任何GeoJSON要素或几何对象：

* Point - 单个点。
* MultiPoint - 点数组。
* LineString - 连续的线的点的数组。
* MultiLineString - 多条线的点的二维数组。
* Polygon - 多边形点的二维数组 （也许有岛）。
* MultiPolygon - 多个多边形的多维数组。
* GeometryCollection - 几何对象的数组。
* Feature - 要素是上面任意一种几何对象。
* FeatureCollection - 要素的数组。

用于渲染球体轮廓的*Sphere*类型也支持，sphere没有坐标。额外的*arguments*沿着[pointRadius](#path_pointRadius)存取器传递。（原文：Any additional *arguments* are passed along to the [pointRadius](#path_pointRadius) accessor.）

将多个要素打包到要素集生成一个path进行展示：

```js
svg.append("path")
    .datum({type: "FeatureCollection", features: features})
    .attr("d", d3.geoPath());
```

或者每个要素单独生成path进行展示：

```js
svg.selectAll("path")
  .data(features)
  .enter().append("path")
    .attr("d", d3.geoPath());
```

每个要素单独生成路径通常比将要素组合慢。然而，每个要素独立对于添加样式和交互（例如，点击或鼠标悬停）是非常有用的。Canvas渲染（请参阅[*path*.context](#path_context)）通常比SVG更快，但添加样式和交互比SVG费劲。

<a href="#path_area" name="path_area">#</a> <i>path</i>.<b>area</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/area.js "Source")

返回指定GeoJSON *object*的平面投影区域（通常以正方形像素为单位）。Point，MultiPoint，LineString和MultiLineString这些几何体的区域为零。对于Polygon和MultiPolygon几何体，此方法首先计算外环的面积，然后减去岛的面积。该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)。这是[d3.geoArea](#geoArea)的平面等价方法。

<a href="#path_bounds" name="path_bounds">#</a> <i>path</i>.<b>bounds</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/bounds.js "Source")

返回指定GeoJSON *object*的平面投影边界（通常以像素为单位）。边界框由二维数组表示：\[\[*x₀*, *y₀*\]， \[*x₁*, *y₁*\]\]，其中*x₀*是最小*x*坐标，*y₀*是最小*y*坐标，*x₁*是最大*x*坐标，*y₁*是最大*y*坐标。这对于缩放至一个特定要素非常方便。（注意，在投影平面坐标中，最小纬度通常是最大*y*值，最大纬度通常是最小*y*值。）该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)。这是[d3.geoBounds](#geoBounds)的平面等价方法。

<a href="#path_centroid" name="path_centroid">#</a> <i>path</i>.<b>centroid</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/centroid.js "Source")

返回指定GeoJSON *object*的平面投影质心（通常以像素为单位）。这对于给省或市添加边界或地图符号化非常方便。例如，[非连续地图](https://bl.ocks.org/mbostock/4055908)需要围绕其质心缩放每个状态。该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)，这是[d3.geoCentroid](#geoCentroid)的平面等价方法。

<a href="#path_measure" name="path_measure">#</a> <i>path</i>.<b>measure</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/measure.js "Source")

返回指定GeoJSON *object*的平面投影返回指定GeoJSON 对象的投影平面长度（通常以像素为单位）。Point和MultiPoint几何体长度为零。对于Polygon和MultiPolygon几何体，此方法计算所有环的总长度。该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)。这是[d3.geoLength](#geoLength)的平面等价方法。

<a href="#path_projection" name="path_projection">#</a> <i>path</i>.<b>projection</b>([<i>projection</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

如果指定了*projection*，设置当前投影为指定的投影。如果未指定*projection*，则返回当前投影，默认为null。投影为空表示一种特定的转换（
The null projection represents the identity transformation）：输入几何不进行投影直接按其原始坐标渲染。这种投影可以用于快速渲染[已经投影过的几何体](https://bl.ocks.org/mbostock/5557726)或快速渲染等距（equirectangular）投影。

指定的投影通常是D3的内置[geographic projections](#projections)之一；但是，任何对象暴露的[*projection*.stream](#projection_stream)都可以使用，从而可以使用[自定义投影](https://bl.ocks.org/mbostock/5663666)。参见D3的[transforms](#transforms)，获取更多任意几何变换的更多的例子。

<a href="#path_context" name="path_context">#</a> <i>path</i>.<b>context</b>([<i>context</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

如果指定了*context*，则设置当前渲染的上下文并返回[路径生成器](#_path)。如果上下文为null，则路径生成器将返回SVG路径字符串；如果上下文为非null，则路径生成器将调用指定上下文中的方法来渲染几何体。上下文必须实现[CanvasRenderingContext2D API](https://www.w3.org/TR/2dcontext/#canvasrenderingcontext2d)的子集：

* *context*.beginPath()
* *context*.moveTo(*x*, *y*)
* *context*.lineTo(*x*, *y*)
* *context*.arc(*x*, *y*, *radius*, *startAngle*, *endAngle*)
* *context*.closePath()

如果未指定*context*，则返回当前渲染的上下文，它的默认值为null。

<a href="#path_pointRadius" name="path_pointRadius">#</a> <i>path</i>.<b>pointRadius</b>([<i>radius</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

如果*radius*指定，设置用于显示Point和MultiPoint半径为指定值。如果未指定*radius*，则返回当前半径访问器，默认值为4.5。虽然半径通常被指定为数字常量，但它也可以被指定为为每个要素进行计算的函数，这个函数可以获取到[path generator](#_path)的全部参数（原文：being passed the any arguments passed to the [path generator](#_path)）。例如，如果您的GeoJSON数据具有附加属性，则可以访问这些属性在pointRadius指定的函数中来改变点大小；或者，您可以使用[d3.symbol](https://github.com/d3/d3-shape#symbols)和[projection](#geoProjection)这两种更加灵活的方式。

### Projections

投影将球面多边形几何体转换为平面多边形几何体。D3提供了如下几类标准投影的实现：

* [Azimuthal](#azimuthal-projections)
* [Composite](#composite-projections)
* [Conic](#conic-projections)
* [Cylindrical](#cylindrical-projections)

有关更多投影，请参阅[d3-geo-projection](https://github.com/d3/d3-geo-projection)。您可以使用[custom projections](#raw-projections)或[d3.geoProjectionMutator](#geoProjectionMutator)实现自定义投影。

<a href="#_projection" name="_projection">#</a> <i>projection</i>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

返回表示指定*point*的投影后的点的新数组\[*x*, *y*\]（通常以像素为单位）。指定*point*必须为以度为单位的双元素数组\[*longitude*, *latitude*\]。如果指定的*point*没有定义的投影位置，例如当该点位于该投影的剪切边界之外时，将返回null 。

<a href="#projection_invert" name="projection_invert">#</a> <i>projection</i>.<b>invert</b>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

以度为单位返回一个以度为单位的新数组\[*longitude*, *latitude*\]，表示指定投影*point*的未投影点。该点必须指定为双元素数组\[*x*, *y*\]（通常以像素为单位）。如果指定的*point*没有定义的投影位置，例如当该点位于该投影的剪切边界之外时，将返回null 。

该方法仅定义在可逆投影上。

<a href="#projection_stream" name="projection_stream">#</a> <i>projection</i>.<b>stream</b>(<i>stream</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

返回指定输出*stream*的[projection stream](#streams)。任何输入的几何体都是先投影然后成为输出流。（原文：Any input geometry is projected before being streamed to the output stream.）典型的投影涉及多个几何变换：输入几何体首先转换为弧度，在三个轴上旋转，剪切到小圆或沿着反面子午线，最后通过自适应重采样、缩放和平移投影到平面。

<a href="#projection_preclip" name="projection_preclip">#</a> <i>projection</i>.<b>preclip</b>([<i>preclip</i>])

如果指定了*preclip*，则将投影的球面剪裁设置为指定的函数并返回投影。如果未指定*preclip*，则返回当前的球面剪裁功能（请参阅[preclip](#preclip)）。

<a href="#projection_postclip" name="projection_postclip">#</a> <i>projection</i>.<b>postclip</b>([<i>postclip</i>])

如果指定了*postclip*，则将投影的平面剪裁设置为指定的函数并返回投影。如果未指定*postclip*，则返回当前的平面剪切函数（请参阅[postclip](#postclip)）。

<a href="#projection_clipAngle" name="projection_clipAngle">#</a> <i>projection</i>.<b>clipAngle</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*angle*，则将投影的剪切圆半径设置为指定的以度为单位的角度并返回投影。（原文：If *angle* is specified, sets the projection’s clipping circle radius to the specified angle in degrees and returns the projection.）如果*angle*为null，则切换到[反面子午线切割](https://bl.ocks.org/mbostock/3788999)而不是小圆切割。如果未指定*angle*，则返回当前剪切角度，默认为null。小圆剪切独立于[*projection*.clipExtent](#projection_clipExtent)视口剪切。

另见[*projection*.preclip](#projection_preclip)，[d3.geoClipAntimeridian](#geoClipAntimeridian)，[d3.geoClipCircle](#geoClipCircle)。

<a href="#projection_clipExtent" name="projection_clipExtent">#</a> <i>projection</i>.<b>clipExtent</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*extent*，则将投影的的视口剪切范围设置为指定的以像素为单位的边界并返回投影。*extent*边界被指定为一个数组\[\[<i>x₀</i>, <i>y₀</i>\]，\[<i>x₁</i>, <i>y₁</i>\]\]，其中<i>x₀</i>是视口的左侧，<i>y₀</i>是视口的顶部，<i>x₁</i>是视口的右侧，<i>y₁</i>是视口的底部。如果*extent*为null，则不执行视口剪切。如果未指定*extent*，则返回当前视口剪切范围，默认为null。视口剪切独立于[*projection*.clipAngle](#projection_clipAngle)小圆剪切。

另请参见[*projection*.postclip](#projection_postclip)，[d3.geoClipRectangle](#geoClipRectangle)。

<a href="#projection_scale" name="projection_scale">#</a> <i>projection</i>.<b>scale</b>([<i>scale</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*scale*，则将投影的缩放系数设置为指定值并返回投影。如果未指定*scale*，则返回当前缩放系数; 默认缩放系数是投影指定的。缩放系数与投影点之间的距离线性对应；但是，相同缩放系数在不同投影下的效果并不完全相同。（原文：however, absolute scale factors are not equivalent across projections.）

<a href="#projection_translate" name="projection_translate">#</a> <i>projection</i>.<b>translate</b>([<i>translate</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*translate*，则将投影的平移距离设置为指定的双元素数组[<i>t<sub>x</sub></i>, <i>t<sub>y</sub></i>]并返回投影。如果未指定*translate*，则返回当前的平移距离，默认为[480,250]。平移距离确定投影的[center](#projection_center)的像素坐标。默认平移距离将⟨0°,0°⟩放置在960×500区域的中心。

<a href="#projection_center" name="projection_center">#</a> <i>projection</i>.<b>center</b>([<i>center</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*center*，则将投影的中心设置为指定的以度为单位的经度和纬度的双元素数组*center*，并返回投影。如果未指定*center*，则返回当前中心，默认为⟨0°，0°⟩。

<a href="#projection_angle" name="projection_angle">#</a> <i>projection</i>.<b>angle</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*angle*，则将投影的投影后平面旋转角度设置为指定的以度为单位的*angle*并返回投影。如果未指定*angle*，则返回投影的当前角度，默认为0°。注意，在渲染期间旋转（例如，使用[*context*.rotate](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rotate)）一般比投影期间旋转更快。

<a href="#projection_rotate" name="projection_rotate">#</a> <i>projection</i>.<b>rotate</b>([<i>angles</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*rotation*，则将投影的[球面旋转的三个轴](https://bl.ocks.org/mbostock/4282586)设置为指定的*angles*，该角度必须是两个或三个元素的数字数组[*lambda*, *phi*, *gamma*]，指定围绕[球面旋转的三个轴](https://bl.ocks.org/mbostock/4282586)的旋转角度。（和姿态角[yaw, pitch and roll](http://en.wikipedia.org/wiki/Aircraft_principal_axes)对应）如果省略旋转角度*gamma*，则默认为0.另请参阅[d3.geoRotation](#geoRotation)。如果未指定*rotation*，则返回当前旋转角度，默认为[0,0,0]。

<a href="#projection_precision" name="projection_precision">#</a> <i>projection</i>.<b>precision</b>([<i>precision</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*precision*，则将投影的[自适应重采样](https://bl.ocks.org/mbostock/3795544)的阈值设置为指定的以像素为单位值并返回投影。该值对应于[Douglas–Peucker](http://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm)距离。如果未指定*precision*，则返回投影的当前重采样精度，默认为√0.5 ≅ 0.70710…

<a href="#projection_fitExtent" name="projection_fitExtent">#</a> <i>projection</i>.<b>fitExtent</b>(<i>extent</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

设置投影的[scale](#projection_scale)和[translate](#projection_translate)使得指定的GeoJSON*object*从中心铺满指定的*extent*。该范围指定为数组\[\[x₀, y₀\], \[x₁, y₁\]\]，其中x₀是边界框的左边，y₀是顶部，x₁是右边，y₁是底部。返回投影。

例如，缩放和平移[新泽西州平面投影](https://bl.ocks.org/mbostock/5126418)以使GeoJSON对象*nj*从中心铺满960×500的边界框，每边有20个像素的填充：

```js
var projection = d3.geoTransverseMercator()
    .rotate([74 + 30 / 60, -38 - 50 / 60])
    .fitExtent([[20, 20], [940, 480]], nj);
```

确定新缩放和平移时，将忽略[clip extent](#projection_clipExtent)。[precision](#projection_precision)用于计算由150缩放计算过的指定的*object*的外接矩形。（原文：The [precision](#projection_precision) used to compute the bounding box of the given *object* is computed at an effective scale of 150.）

<a href="#projection_fitSize" name="projection_fitSize">#</a> <i>projection</i>.<b>fitSize</b>(<i>size</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

[*projection*.fitExtent](#projection_fitExtent)的便捷方法，其中范围的左上角是[0,0]。以下两个语句是等效的：

```js
projection.fitExtent([[0, 0], [width, height]], object);
projection.fitSize([width, height], object);
```

<a href="#projection_fitWidth" name="projection_fitWidth">#</a> <i>projection</i>.<b>fitWidth</b>(<i>width</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

[*projection*.fitSize](#projection_fitSize)的便捷方法，其中高度自动由*object*的纵横比和指定的*width*计算。

<a href="#projection_fitHeight" name="projection_fitHeight">#</a> <i>projection</i>.<b>fitHeight</b>(<i>height</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

[*projection*.fitSize](#projection_fitSize)的便捷方法，其中宽度自动由*object*的纵横比和指定的*height*计算。

#### 方位投影

方位投影将球体直接投影到平面上。

<a href="#geoAzimuthalEqualArea" name="geoAzimuthalEqualArea">#</a> d3.<b>geoAzimuthalEqualArea</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/azimuthalEqualArea.js "Source")
<br><a href="#geoAzimuthalEqualAreaRaw" name="geoAzimuthalEqualAreaRaw">#</a> d3.<b>geoAzimuthalEqualAreaRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/azimuthalEqualArea.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757101)

等积方位投影。

<a href="#geoAzimuthalEquidistant" name="geoAzimuthalEquidistant">#</a> d3.<b>geoAzimuthalEquidistant</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/azimuthalEquidistant.js "Source")
<br><a href="#geoAzimuthalEquidistantRaw" name="geoAzimuthalEquidistantRaw">#</a> d3.<b>geoAzimuthalEquidistantRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/azimuthalEquidistant.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757110)

等距方位投影。

<a href="#geoGnomonic" name="geoGnomonic">#</a> d3.<b>geoGnomonic</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/gnomonic.js "Source")
<br><a href="#geoGnomonicRaw" name="geoGnomonicRaw">#</a> d3.<b>geoGnomonicRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/gnomonic.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757349)

gnomonic投影。

<a href="#geoOrthographic" name="geoOrthographic">#</a> d3.<b>geoOrthographic</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/orthographic.js "Source")
<br><a href="#geoOrthographicRaw" name="geoOrthographicRaw">#</a> d3.<b>geoOrthographicRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/orthographic.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757125)

正交投影。

<a href="#geoStereographic" name="geoStereographic">#</a> d3.<b>geoStereographic</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/stereographic.js "Source")
<br><a href="#geoStereographicRaw" name="geoStereographicRaw">#</a> d3.<b>geoStereographicRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/stereographic.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757137)

立体投影。

#### Equal-Earth

<a href="#geoEqualEarth" name="geoEqualEarth">#</a> d3.<b>geoEqualEarth</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/equalEarth.js "Source")
<br><a href="#geoEqualEarthRaw" name="geoEqualEarthRaw">#</a> d3.<b>geoEqualEarthRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/equalEarth.png" width="480" height="250">](http://shadedrelief.com/ee_proj/)

The Equal Earth projection, by Bojan Šavrič _et al._, 2018.

#### 复合投影

复合投影由多个投影组成，这些投影进行组合显示到一张地图上。组成复合投影的投影的具有固定的剪切，中心和旋转，因此复合投影不支持[*projection*.center](#projection_center)、[*projection*.rotate](#projection_rotate)、[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)。

<a href="#geoAlbersUsa" name="geoAlbersUsa">#</a> d3.<b>geoAlbersUsa</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/albersUsa.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/albersUsa.png" width="480" height="250">](https://bl.ocks.org/mbostock/4090848)

这是以美国为中心的三个[d3.geoConicEqualArea](#geoConicEqualArea)投影的复合投影：[d3.geoAlbers](#geoAlbers)用于低纬度的四十八个州（原文： [d3.geoAlbers](#geoAlbers) is used for the lower forty-eight states），并且单独使用等积圆锥投影阿拉斯加和夏威夷。请注意，阿拉斯加的比例缩小：预计为其真实面积的0.35倍。Philippe Rivière的这张图使用阿拉斯加和夏威夷的两个矩形插图说明了这个投影：

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/albersUsa-parameters.png" width="480" height="250">](https://bl.ocks.org/Fil/7723167596af40d9159be34ffbf8d36b)

更多示例，请参阅[d3-composite-projections](http://geoexamples.com/d3-composite-projections/) 。

#### 圆锥投影

圆锥投影将球体投影到圆锥体上，然后将圆锥体展开到平面上。圆锥投影有[two standard parallels](#conic_parallels)。

<a href="#conic_parallels" name="conic_parallels">#</a> <i>conic</i>.<b>parallels</b>([<i>parallels</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conic.js "Source")

[two standard parallels](https://en.wikipedia.org/wiki/Map_projection#Conic)定义了圆锥投影的地图布局。

<a href="#geoAlbers" name="geoAlbers">#</a> d3.<b>geoAlbers</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/albers.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/albers.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734308)

Albers的等积圆锥投影。这是以美国为中心的[d3.geoConicEqualArea](#geoConicEqualArea)配置。

<a href="#geoConicConformal" name="geoConicConformal">#</a> d3.<b>geoConicConformal</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicConformal.js "Source")
<br><a href="#geoConicConformalRaw" name="geoConicConformalRaw">#</a> d3.<b>geoConicConformalRaw</b>(<i>phi0</i>, <i>phi1</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicConformal.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/conicConformal.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734321)

等角圆锥投影。默认平行线为[30°, 30°]，造成平顶。（原文：The parallels default to [30°, 30°] resulting in flat top.）另见[*conic*.parallels](#conic_parallels)。

<a href="#geoConicEqualArea" name="geoConicEqualArea">#</a> d3.<b>geoConicEqualArea</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEqualArea.js "Source")
<br><a href="#geoConicEqualAreaRaw" name="geoConicEqualAreaRaw">#</a> d3.<b>geoConicEqualAreaRaw</b>(<i>phi0</i>, <i>phi1</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEqualArea.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/conicEqualArea.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734308)

Albers的等积圆锥投影。另见[*conic*.parallels](#conic_parallels)。

<a href="#geoConicEquidistant" name="geoConicEquidistant">#</a> d3.<b>geoConicEquidistant</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEquidistant.js "Source")
<br><a href="#geoConicEquidistantRaw" name="geoConicEquidistantRaw">#</a> d3.<b>geoConicEquidistantRaw</b>(<i>phi0</i>, <i>phi1</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEquidistant.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/conicEquidistant.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734317)

等距圆锥投影。另见[*conic*.parallels](#conic_parallels)。

#### 圆柱投影

圆柱投影将球体投射到圆柱体上，然后将圆柱体展开到平面上。[伪圆柱投影](http://www.progonos.com/furuti/MapProj/Normal/ProjPCyl/projPCyl.html)是圆柱投影的推广。

<a href="#geoEquirectangular" name="geoEquirectangular">#</a> d3.<b>geoEquirectangular</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/equirectangular.js "Source")
<br><a href="#geoEquirectangularRaw" name="geoEquirectangularRaw">#</a> d3.<b>geoEquirectangularRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/equirectangular.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757119)

等距（plate carrée）投影。

<a href="#geoMercator" name="geoMercator">#</a> d3.<b>geoMercator</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/mercator.js "Source")
<br><a href="#geoMercatorRaw" name="geoMercatorRaw">#</a> d3.<b>geoMercatorRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/mercator.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757132)

球形墨卡托投影。定义默认[*projection*.clipExtent](#projection_clipExtent)，使地球投影到一个正方形，剪裁到大约±85°纬度。

<a href="#geoTransverseMercator" name="geoTransverseMercator">#</a> d3.<b>geoTransverseMercator</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/transverseMercator.js "Source")
<br><a href="#geoTransverseMercatorRaw" name="geoTransverseMercatorRaw">#</a> d3.<b>geoTransverseMercatorRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/transverseMercator.png" width="480" height="250">](https://bl.ocks.org/mbostock/4695821)

横轴球墨卡托投影。定义[*projection*.clipExtent](#projection_clipExtent)，使世界投影到一个正方形，剪裁到大约±85°纬度。

<a href="#geoNaturalEarth1" name="geoNaturalEarth1">#</a> d3.<b>geoNaturalEarth1</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/naturalEarth1.js "Source")
<br><a href="#geoNaturalEarth1Raw" name="geoNaturalEarth1Raw">#</a> d3.<b>geoNaturalEarth1Raw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/naturalEarth1.png" width="480" height="250">](https://bl.ocks.org/mbostock/4479477)

[自然地球投影](http://www.shadedrelief.com/NE_proj/)是由Tom Patterson设计的伪圆柱投影。它既不等角也不等积，而是全世界的小比例地图。（原文：but appealing to the eye for small-scale maps of the whole world.）

### 原始投影

原始投影是用于实现自定义投影的点变换函数；它们通常传递给[d3.geoProjection](#geoProjection)或[d3.geoProjectionMutator](#geoProjectionMutator)。暴露出来原始投影用来衍生相关投影。原始投影以弧度（不是角度！）取球面坐标\[*lambda*, *phi*\]并返回点\[*x*, *y*\]，通常在以原点为中心的单位正方形中。（原文：typically in the unit square centered around the origin.）

<a href="#_project" name="_project">#</a> <i>project</i>(<i>lambda</i>, <i>phi</i>)

投影以弧度表示的指定点[<i>lambda</i>, <i>phi</i>]，在无单位坐标中返回新点\[*x*, *y*\]。

<a href="#project_invert" name="project_invert">#</a> <i>project</i>.<b>invert</b>(<i>x</i>, <i>y</i>)

[*project*](#_project)的逆。

<a href="#geoProjection" name="geoProjection">#</a> d3.<b>geoProjection</b>(<i>project</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

构建一个新投影从指定[原始投影](#_project)的*project*。该*project*函数采用以[弧度](http://mathworld.wolfram.com/Radian.html)表示的*longitude*和*latitude*，通常被称为*lambda* (λ)和*phi* (φ)，并返回数组\[*x*, *y*\]表示其单元投影。（原文：and returns a two-element array \[*x*, *y*\] representing its unit projection.）*project*函数不需要缩放和平移这个点，因为会自动应用[*projection*.scale](#projection_scale)、[*projection*.translate](#projection_translate)和[*projection*.center](#projection_center)。同样，*project*函数不需要执行任何球面旋转，因为在投影之前已经应用[*projection*.rotate](#projection_rotate)。

例如，球形墨卡托投影可以这样实现：

```js
var mercator = d3.geoProjection(function(x, y) {
  return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
});
```

如果指定的*project*函数暴露了*invert*方法，则返回的投影也会暴露[*projection*.invert](#projection_invert)。

<a href="#geoProjectionMutator" name="geoProjectionMutator">#</a> d3.<b>geoProjectionMutator</b>(<i>factory</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

构建一个新投影从指定[原始投影](#_project)的*factory*，并返回一个当原始投影发生变化时调用的*mutate*函数。指定的*factory*必须返回一个原始的投影。返回的*mutate*函数的返回值是包装后的投影。例如，圆锥投影通常具有两条可配置的平行线。一个合适的*factory*函数，如[d3.geoConicEqualAreaRaw](#geoConicEqualAreaRaw)，将具有以下形式：

```js
// y0 and y1 represent two parallels
function conicFactory(phi0, phi1) {
  return function conicRaw(lambda, phi) {
    return […, …];
  };
}
```

使用d3.geoProjectionMutator可以实例化一个允许修改平行线的标准投影，使用[d3.geoProjection](#geoProjection)重新分配内部使用的原始投影：

```js
function conicCustom() {
  var phi0 = 29.5,
      phi1 = 45.5,
      mutate = d3.geoProjectionMutator(conicFactory),
      projection = mutate(phi0, phi1);

  projection.parallels = function(_) {
    return arguments.length ? mutate(phi0 = +_[0], phi1 = +_[1]) : [phi0, phi1];
  };

  return projection;
}
```

在创建可变投影时，通常不会公开*mutate*函数。

### 球面数学

<a name="geoArea" href="#geoArea">#</a> d3.<b>geoArea</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/area.js "Source")

返回指定GeoJSON*object*的球面区域的[球面度](http://mathworld.wolfram.com/Steradian.html)（译者注：整个球的球面度为4）。这是[*path*.area](#path_area)的球面等价方法。

<a name="geoBounds" href="#geoBounds">#</a> d3.<b>geoBounds</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/bounds.js "Source")

返回指定GeoJSON*object*的[球面边界框](https://www.jasondavies.com/maps/bounds/)。边界框由二维数组表示：\[\[*left*, *bottom*\], \[*right*, *top*\]\]，其中left是最小经度，bottom是最小纬度，right是最大经度，top是最大纬度。所有坐标均以度为单位。（注意，在平面投影坐标中，最小纬度通常是最大*y*值，最大纬度通常是最小*y*值。）这是[*path*.bounds](#path_bounds)的球面等价方法。

<a name="geoCentroid" href="#geoCentroid">#</a> d3.<b>geoCentroid</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/centroid.js "Source")

返回指定GeoJSON*object*的球面质心。这是[*path*.centroid](#path_centroid)的球面等价方法。

<a name="geoDistance" href="#geoDistance">#</a> d3.<b>geoDistance</b>(<i>a</i>, <i>b</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/distance.js "Source")

返回指定*a*和*b*两点之间以[弧度](http://mathworld.wolfram.com/Radian.html)表示的距离。必须将每个点指定为以度为单位的双元素数组\[*longitude*, *latitude*\]。这是平面上使用度[*path*.measure](#path_measure)测量两点线段长度的球面等价方法。（原文：This is the spherical equivalent of [*path*.measure](#path_measure) given a LineString of two points.）

<a name="geoLength" href="#geoLength">#</a> d3.<b>geoLength</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/length.js "Source")

返回指定GeoJSON *object*之间以[弧度](http://mathworld.wolfram.com/Radian.html)表示的距离。以弧度形式返回指定GeoJSON 对象的大弧长度。对于多边形，返回外圈的周长加上全部岛的周长。这是平面上测量线段长度[*path*.measure](#path_measure)的球面等价方法。

<a name="geoInterpolate" href="#geoInterpolate">#</a> d3.<b>geoInterpolate</b>(<i>a</i>, <i>b</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/interpolate.js "Source")

返回指定两点*a*和*b*的插值函数。必须将每个点指定为以度为单位的双元素数组\[*longitude*, *latitude*\]。返回的插值函数带有一个参数*t*，其中*t*是0到1之间的数字; 值0返回点*a*，值1返回点*b*。沿着穿过*a*和*b*的大弧从*a*到*b*插值生成中间值。如果*a*和*b*是对跖点（译者注：[对跖点](https://en.wikipedia.org/wiki/Antipodes)地球同一直径的两个端点。），则选择任意大弧。

<a name="geoContains" href="#geoContains">#</a> d3.<b>geoContains</b>(<i>object</i>, <i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/contains.js "Source")

当且仅当指定GeoJSON *object*包含指定的*point*返回值true，否则返回假。必须将该点指定为以度为单位的双元素数组\[*longitude*, *latitude*\]。对于Point和MultiPoint几何体，使用精确测试；对于一个球体，总是返回true；对于其他几何体，使用epsilon阈值。

<a name="geoRotation" href="#geoRotation">#</a> d3.<b>geoRotation</b>(<i>angles</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/rotation.js "Source")

如果指定了*rotation*，则将投影的[球面旋转的三个轴](https://bl.ocks.org/mbostock/4282586)设置为指定的*angles*，该角度必须是以度表示[球面旋转的三个轴](https://bl.ocks.org/mbostock/4282586)（和姿态角[yaw, pitch and roll](http://en.wikipedia.org/wiki/Aircraft_principal_axes)对应）的两个或三个元素的数字数组[*lambda*, *phi*, *gamma*]。如果省略旋转角度*gamma*，则默认为0.另请参阅[d3.geoRotation](#geoRotation)。

<a name="_rotation" href="#_rotation">#</a> <i>rotation</i>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/rotation.js "Source")

以度为单位返回一个新数组\[*longitude*, *latitude*\]，表示指定*point*的旋转点。以度为单位返回指定*point*的选装新数组\[*longitude*, *latitude*\]。该点指定为以度为单位的双元素数组\[*longitude*, *latitude*\]。

<a name="rotation_invert" href="#rotation_invert">#</a> <i>rotation</i>.<b>invert</b>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/rotation.js "Source")

以度为单位返回一个新的数组\[*longitude*, *latitude*\]，表示指定*point*的反转点；[*rotation*](#_rotation)的反转。（原文：the inverse of [*rotation*](#_rotation).）必须将该点指定为以度为单位的双元素数组\[*longitude*, *latitude*\]。

### （球体形状）Spherical Shapes

要生成一个[大弧](https://en.wikipedia.org/wiki/Great-circle_distance)（一个大圆的一部分），只需将GeoJSON LineString几何对象传递给[d3.geoPath](#geoPath)。D3的投影使用大弧插值生成中间点，因此不需要大弧形发生器。

<a name="geoCircle" href="#geoCircle">#</a> d3.<b>geoCircle</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

返回一个新的圆生成器。

<a name="_circle" href="#_circle">#</a> <i>circle</i>(<i>arguments…</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

返回一个新的类型为“Polygon”的GeoJSON几何对象，这个几何对象近似于球体表面上的圆，具有当前的[center](#circle_center)，[radius](#circle_radius)和[precision](#circle_precision)。*arguments*传递给访问器。（原文：Any *arguments* are passed to the accessors.）

<a name="circle_center" href="#circle_center">#</a> <i>circle</i>.<b>center</b>([<i>center</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

如果指定*center*，设定圆心到指定的以度数为单位的点\[*longitude*, *latitude*\]，并返回该圆的生成器。中心也可以指定为函数；每当[生成](#_circle)一个圆时，将调用此函数，这个函数可以获取到圆生成器的全部参数。（原文：being passed any arguments passed to the circle generator.）如果未指定*center*，则返回当前的中心访问器，默认为：

```js
function center() {
  return [0, 0];
}
```

<a name="circle_radius" href="#circle_radius">#</a> <i>circle</i>.<b>radius</b>([<i>radius</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

如果指定*radius*，设置圆半径为指定以度为单位的角度，并返回该圆生成器。半径也可以指定为函数；每当[生成](#_circle)一个圆时，将调用此函数，这个函数可以获取到圆生成器的全部参数。（原文：being passed any arguments passed to the circle generator.）如果未指定*radius*，则返回当前半径访问器，默认为：

```js
function radius() {
  return 90;
}
```

<a name="circle_precision" href="#circle_precision">#</a> <i>circle</i>.<b>precision</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

如果指定*precision* ，设置圆精度为指定以度为单位的角度，然后返回该圆发生器。精度也可以指定为函数；每当[生成](#_circle)一个圆时，将调用此函数，这个函数可以获取到圆生成器的全部参数。（原文：being passed any arguments passed to the circle generator.）如果未指定*precision*，则返回当前精度访问器，默认为：

```js
function precision() {
  return 6;
}
```

小圆圈不遵循大弧，因此生成的多边形只是近似值。（原文：Small circles do not follow great arcs and thus the generated polygon is only an approximation.）指定角度精度为较小值可提高多边形近似的精度，但也会增加生成和渲染它的成本。

<a name="geoGraticule" href="#geoGraticule">#</a> d3.<b>geoGraticule</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

构造一个用于创建经纬网的几何生成器：展示变形的投影使用均匀的[经线](https://en.wikipedia.org/wiki/Meridian_\(geography\))和[纬线](https://en.wikipedia.org/wiki/Circle_of_latitude)。（原文：Constructs a geometry generator for creating graticules: a uniform grid of [经线](https://en.wikipedia.org/wiki/Meridian_\(geography\)) and [纬线圈](https://en.wikipedia.org/wiki/Circle_of_latitude) for showing projection distortion.）默认经纬网在有纬线，纬度±80°之间每隔10°有经线；对于极地地区，每隔90°有经线。

<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/graticule.png" width="480" height="360">

<a name="_graticule" href="#_graticule">#</a> <i>graticule</i>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

返回表示此经纬网的所有经线和纬线的GeoJSON MultiLineString几何对象。

<a name="graticule_lines" href="#graticule_lines">#</a> <i>graticule</i>.<b>lines</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

返表示此经纬网的所有经线和纬线的GeoJSON LineString几何体对象的数组。（原文：
Returns an array of GeoJSON LineString geometry objects, one for each meridian or parallel for this graticule.）

<a name="graticule_outline" href="#graticule_outline">#</a> <i>graticule</i>.<b>outline</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

返回表示此经纬网轮廓的GeoJSON Polygon几何体对象，即沿着经线和纬线定义的范围。

<a name="graticule_extent" href="#graticule_extent">#</a> <i>graticule</i>.<b>extent</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

如果指定*extent*，设置此经纬网的主范围和次范围。如果未指定*extent*，返回当前次范围，默认为⟨⟨-180°, -80° - ε⟩, ⟨180°, 80° + ε⟩⟩。

<a name="graticule_extentMajor" href="#graticule_extentMajor">#</a> <i>graticule</i>.<b>extentMajor</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

如果指定*extent*，设置此经纬网的主范围。如果未指定*extent*，返回当前主范围，默认为⟨⟨-180°, -90° + ε⟩, ⟨180°, 90° - ε⟩⟩。

<a name="graticule_extentMinor" href="#graticule_extentMinor">#</a> <i>graticule</i>.<b>extentMinor</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

如果指定*extent*，设置此经纬网的次范围。如果未指定*extent*，返回当前次范围，默认为⟨⟨-180°, -80° - ε⟩, ⟨180°, 80° + ε⟩⟩。

<a name="graticule_step" href="#graticule_step">#</a> <i>graticule</i>.<b>step</b>([<i>step</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

如果指定了*step*，则设置此经纬网的主step和次step。如果未指定*step*，则返回当前的次step，默认为⟨10°, 10°⟩。

<a name="graticule_stepMajor" href="#graticule_stepMajor">#</a> <i>graticule</i>.<b>stepMajor</b>([<i>step</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

如果指定了*step*，则设置此经纬网的主step。如果未指定*step*，则返回当前的主step，默认为⟨90°, 360°⟩。

<a name="graticule_stepMinor" href="#graticule_stepMinor">#</a> <i>graticule</i>.<b>stepMinor</b>([<i>step</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

如果指定了*step*，则设置此经纬网的次step。如果未指定*step*，则返回当前的次step，默认为⟨10°, 10°⟩。

<a name="graticule_precision" href="#graticule_precision">#</a> <i>graticule</i>.<b>precision</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

如果指定*precision*，设置此经纬网的精度为指定以度为单位的精度。如果未指定*precision*，则返回当前精度，默认为2.5°。

<a name="geoGraticule10" href="#geoGraticule10">#</a> d3.<b>geoGraticule10</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

一种直接生成10°全球经纬网的GeoJSON MultiLineString几何对象的便捷方法。相当于：

```js
function geoGraticule10() {
  return d3.geoGraticule()();
}
```

### 流

D3通过调用一系列函数进行几何变换，而不是具体化中间表示以减小开销。流必须实现几种方法来接收输入几何。流本质上是有状态的；一个[点](#point)的含义取决于该点是否在一条[线](#lineStart)的内部，同样一条线与一个[多边形](#polygonStart)的边界分开。尽管名称为“stream”，但这些方法调用目前是同步的。

<a href="#geoStream" name="geoStream">#</a> d3.<b>geoStream</b>(<i>object</i>, <i>stream</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/stream.js "Source")

将指定的[GeoJSON](http://geojson.org) *object*流式传输到指定的[projection *stream*](#projection-streams)。虽然支持要素和几何体对象作为输入，但流界面仅描述几何体，因此流不可见其他要素属性。

<a name="stream_point" href="#stream_point">#</a> <i>stream</i>.<b>point</b>(<i>x</i>, <i>y</i>[, <i>z</i>])

表示具有指定坐标*x*和*y*（以及可选*z*）的点。坐标系未指定且与实现相关；例如，[projection streams](https://github.com/d3/d3-geo-projection)需要以度为单位的球面坐标作为输入。在一个多边形或线的上下文之外，一个点表示一个点几何对象（[点](http://www.geojson.org/geojson-spec.html#point)或[多点](http://www.geojson.org/geojson-spec.html#multipoint)）。在线或多边形边界，该点表示控制点。

<a name="stream_lineStart" href="#stream_lineStart">#</a> <i>stream</i>.<b>lineStart</b>()

表示线或多边形边界的开始。在多边形内，表示多边形边界的开始。多边形的第一个环是外环，通常是顺时针的。任何后续边界表示多边形中的岛，并且通常是逆时针方向。

<a name="stream_lineEnd" href="#stream_lineEnd">#</a> <i>stream</i>.<b>lineEnd</b>()

表示线或多边形边界的结束。在多边形内，表示多边形边界的结束。与GeoJSON不同，多边形边界的冗余闭合坐标*不是*通过[点](#point)指示的，而是通过多边形内的lineEnd隐含。因此，给定的多边形输入：

```json
{
  "type": "Polygon",
  "coordinates": [
    [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
  ]
}
```

将在流上产生以下一系列方法调用：

```js
stream.polygonStart();
stream.lineStart();
stream.point(0, 0);
stream.point(0, 1);
stream.point(1, 1);
stream.point(1, 0);
stream.lineEnd();
stream.polygonEnd();
```

<a name="stream_polygonStart" href="#stream_polygonStart">#</a> <i>stream</i>.<b>polygonStart</b>()

表示多边形的开始。多边形的第一行表示外环，任何后续行表示内部岛。

<a name="stream_polygonEnd" href="#stream_polygonEnd">#</a> <i>stream</i>.<b>polygonEnd</b>()

表示多边形的结尾。

<a name="stream_sphere" href="#stream_sphere">#</a> <i>stream</i>.<b>sphere</b>()

表示球体（地球；单位球体以⟨0,0,0⟩为中心）。

### 变换

变换是投影的一般化。转换实现[*projection*.stream](#projection_stream)并可以传递给[*path*.projection](#path_projection)。然而，它们仅实现其他投影方法的子集，并且表示任意几何变换而不是从球面到平面坐标的投影。

<a href="#geoTransform" name="geoTransform">#</a> d3.<b>geoTransform</b>(<i>methods</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/transform.js "Source")

使用在指定*methods*对象上定义的方法，定义任意变换。任何未定义的方法都将使用将输入传送到输出流的传递方法。例如，要将*y*反射（原文：to reflect the *y*-dimension）（另请参见[*identity*.reflectY](#identity_reflectY)）：

```js
var reflectY = d3.geoTransform({
  point: function(x, y) {
    this.stream.point(x, -y);
  }
});
```

或者定义仿射矩阵变换：

```js
function matrix(a, b, c, d, tx, ty) {
  return d3.geoTransform({
    point: function(x, y) {
      this.stream.point(a * x + b * y + tx, c * x + d * y + ty);
    }
  });
}
```

<a href="#geoIdentity" name="geoIdentity">#</a> d3.<b>geoIdentity</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/identity.js "Source")

特征变换可用于缩放，平移和剪裁平面几何体。它实现了[*projection*.scale](#projection_scale)，[*projection*.translate](#projection_translate)，[*projection*.fitExtent](#projection_fitExtent)，[*projection*.fitSize](#projection_fitSize)，[*projection*.fitWidth](#projection_fitWidth)，[*projection*.fitHeight](#projection_fitHeight)和[*projection*.clipExtent](#projection_clipExtent)。

<a href="#identity_reflectX" name="identity_reflectX">#</a> <i>identity</i>.<b>reflectX</b>([<i>reflect</i>])

如果指定了*reflect*，则设置*x*否在输出中反射（变为相反数）。如果未指定*reflect*，则在启用*x*反射时返回true ，默认为false。

<a href="#identity_reflectY" name="identity_reflectY">#</a> <i>identity</i>.<b>reflectY</b>([<i>reflect</i>])

如果指定了*reflect*，则设置*y*否在输出中反射（变为相反数）。如果未指定*reflect*，则在启用*y*反射时返回true ，默认为false。这对于从标准[空间参考系统](https://en.wikipedia.org/wiki/Spatial_reference_system)进行转换特别有用，该系统将正*y*视为向上，显示坐标系统诸如使用Canvas和SVG将正*y*y视为向下。

### 剪裁

投影分两个阶段进行几何形状的切割或裁剪。

<a name="preclip" href="#preclip">#</a> <i>preclip</i>(<i>stream</i>)

预剪裁发生在地理坐标中。沿着反面子午线线切割，或沿着小圆裁剪是最常见的策略。

参见[*projection*.preclip](#projection_preclip).

<a name="postclip" href="#postclip">#</a> <i>postclip</i>(<i>stream</i>)

后剪裁发生在平面，当投影被限制到某个范围（例如矩形）时。

参见[*projection*.postclip](#projection_postclip).

裁剪函数被实现为[projection stream](#streams)的转换。预裁剪在以弧度为单位的球面坐标上进行操作。后裁剪在以像素为单位的平面坐标上操作。

<a name="geoClipAntimeridian" href="#geoClipAntimeridian">#</a> d3.<b>geoClipAntimeridian</b>

裁剪函数，其对流进行变换，使得穿过反面子午线的几何形状（线或多边形）被切成两个，每边一个。通常用于预裁剪。

<a name="geoClipCircle" href="#geoClipCircle">#</a> d3.<b>geoClipCircle</b>(<i>angle</i>)

生成裁剪函数，该剪切函数对流进行变换，使得几何体限定在由围绕投影[中心](#projection_center)的半径*angle*的小圆圈内。通常用于预裁剪。

<a name="geoClipRectangle" href="#geoClipRectangle">#</a> d3.<b>geoClipRectangle</b>(<i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>)

生成裁剪函数，该剪切函数转换流，使得几何图形限定在坐标[[<i>x0</i>, <i>y0</i>], [<i>x1</i>, <i>y1</i>]]的矩形内。通常用于后裁剪。

