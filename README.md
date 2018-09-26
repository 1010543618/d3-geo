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

如果您使用NPM， npm install d3-geo。否则，请下载最新版本。您也可以直接从d3js.org加载，作为独立库或作为D3 4.0的一部分。支持AMD，CommonJS和vanilla环境。在香草中，d3全球出口：
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
地理路径生成器d3.geoPath类似于d3-shape中的形状生成器：给定GeoJSON几何或要素对象，它生成SVG路径数据字符串或呈现Canvas的路径。动态或交互的投影建议使用Canvas以提高性能。路径可以与投影或变换一起使用，也可以用于将平面几何体直接渲染到Canvas或SVG。

[d3.geoPath](#geoPath)是一个类似形状生成器[d3-shape](https://github.com/d3/d3-shape)的地理路径生成器：它可以由给定GeoJSON几何体或要素对象，它生成SVG路径数据字符串或[渲染Canvas的路径](https://bl.ocks.org/mbostock/3783604)。动态或交互的投影建议使用Canvas以提高性能。路径可以与[projections](#projections)或者[transforms](#transforms)一起使用，也可以将平面几何体直接渲染到Canvas或SVG。

<a href="#geoPath" name="geoPath">#</a> d3.<b>geoPath</b>([<i>projection</i>[, <i>context</i>]]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

使用默认设置创建新的地理路径生成器。给定*projection*将调用[projection](#path_projection)设置当前投影，给定*context*将调用[context](#path_context)设置当前上下文。

<a href="#_path" name="_path">#</a> <i>path</i>(<i>object</i>[, <i>arguments…</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

渲染给定*object*，可以是任何GeoJSON要素或几何对象：

* Point - 单个位置。
* MultiPoint - 位置数组。
* LineString - 连续的线的位置数组。
* MultiLineString - 多条线的位置二维数组。
* Polygon - 多边形的位置二维数组 （也许有岛）。
* MultiPolygon - 多个多边形的多维数组。
* GeometryCollection - 几何对象的数组。
* Feature - 要素是上面任意一种几何对象。
* FeatureCollection - 要素的数组。

用于渲染球体轮廓的*Sphere*类型也支持，sphere没有坐标。额外的*arguments*沿着[pointRadius](#path_pointRadius)存取器传递。（原文：Any additional *arguments* are passed along to the [pointRadius](#path_pointRadius) accessor.）

将多种要素打包到要素集中进行展示：

```js
svg.append("path")
    .datum({type: "FeatureCollection", features: features})
    .attr("d", d3.geoPath());
```

或者生成多个路径：（原文：Or use multiple path elements:）

```js
svg.selectAll("path")
  .data(features)
  .enter().append("path")
    .attr("d", d3.geoPath());
```

每个元素独立通常比将元素组合慢。然而，每个元素独立对于添加样式和交互（例如，点击或鼠标悬停）是非常有用的。Canvas渲染（请参阅[*path*.context](#path_context)）通常比SVG更快，但添加样式和交互比SVG费劲。

<a href="#path_area" name="path_area">#</a> <i>path</i>.<b>area</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/area.js "Source")

返回给定GeoJSON *object*的平面投影区域（通常以正方形像素为单位）（原文：(typically in square pixels)）。Point，MultiPoint，LineString和MultiLineString这些几何体的区域为零。对于Polygon和MultiPolygon几何体，此方法首先计算外环的面积，然后减去岛的面积。该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)。这和[d3.geoArea](#geoArea)获取到的地理坐标进行投影结果一样。（原文：This is the planar equivalent of [d3.geoArea](#geoArea).）

<a href="#path_bounds" name="path_bounds">#</a> <i>path</i>.<b>bounds</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/bounds.js "Source")

返回给定GeoJSON *object*的平面投影边界（通常以像素为单位）。边界框由二维数组表示：\[\[*x₀*, *y₀*\]， \[*x₁*, *y₁*\]\]，其中*x₀*是最小*x*坐标，*y₀*是最小*y*坐标，*x₁*是最大*x*坐标，*y₁*是最大*y*坐标。这对于缩放至一个特定要素非常方便。（注意，在投影平面坐标中，最小纬度通常是最大*y*值，最大纬度通常是最小*y*值。）该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)。这和[d3.geoBounds](#geoBounds)获取到的地理坐标进行投影结果一样。（原文：This is the planar equivalent of [d3.geoBounds](#geoBounds).）

<a href="#path_centroid" name="path_centroid">#</a> <i>path</i>.<b>centroid</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/centroid.js "Source")

返回给定GeoJSON *object*的平面投影质心（通常以像素为单位）。这对于给省或市添加边界或地图符号化非常方便。例如，[非连续地图](https://bl.ocks.org/mbostock/4055908)需要围绕其质心缩放每个状态。该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)，这和[d3.geoCentroid](#geoCentroid)获取到的地理坐标进行投影结果一样。（原文：This is the planar equivalent of [d3.geoCentroid](#geoCentroid).）

<a href="#path_measure" name="path_measure">#</a> <i>path</i>.<b>measure</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/path/measure.js "Source")

返回给定GeoJSON *object*的平面投影返回给定GeoJSON 对象的投影平面长度（通常以像素为单位）。Point和MultiPoint几何体长度为零。对于Polygon和MultiPolygon几何体，此方法计算所有环的总长度。该方法遵守[projection](#path_projection)提供的任何裁剪（原文：This method observes any clipping performed by the [projection](#path_projection)），参见[*projection*.clipAngle](#projection_clipAngle)和[*projection*.clipExtent](#projection_clipExtent)。这和[d3.geoLength](#geoLength)获取到的地理坐标进行投影结果一样。（原文：This is the planar equivalent of [d3.geoLength](#geoLength).）

<a href="#path_projection" name="path_projection">#</a> <i>path</i>.<b>projection</b>([<i>projection</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

如果给定了*projection*，设置当前投影为给定的投影。如果未给定*projection*，则返回当前投影，默认为null。投影为空表示一种特定的转换（
The null projection represents the identity transformation）：输入几何不进行投影直接按其原始坐标渲染。这种投影可以用于快速渲染[已经投影过的几何体](https://bl.ocks.org/mbostock/5557726)或快速渲染等距（equirectangular）投影。

给定的投影通常是D3的内置[geographic projections](#projections)之一；但是，任何对象暴露的[*projection*.stream](#projection_stream)都可以使用，从而可以使用[自定义投影](https://bl.ocks.org/mbostock/5663666)。参见D3的[transforms](#transforms)，获取更多任意几何变换的更多的例子。

<a href="#path_context" name="path_context">#</a> <i>path</i>.<b>context</b>([<i>context</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

如果给定了*context*，则设置当前渲染的上下文并返回[路径生成器](#_path)。如果上下文为null，则路径生成器将返回SVG路径字符串；如果上下文为非null，则路径生成器将调用给定上下文中的方法来渲染几何体。上下文必须实现[CanvasRenderingContext2D API](https://www.w3.org/TR/2dcontext/#canvasrenderingcontext2d)的子集：

* *context*.beginPath()
* *context*.moveTo(*x*, *y*)
* *context*.lineTo(*x*, *y*)
* *context*.arc(*x*, *y*, *radius*, *startAngle*, *endAngle*)
* *context*.closePath()

如果未给定*context*，则返回当前渲染的上下文，它的默认值为null。

<a href="#path_pointRadius" name="path_pointRadius">#</a> <i>path</i>.<b>pointRadius</b>([<i>radius</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/path/index.js "Source")

如果*radius*给定，设置用于显示Point和MultiPoint半径为给定值。如果未给定radius，则返回当前半径访问器，默认值为4.5。虽然半径通常被给定为数字常量，但它也可以被给定为为每个要素进行计算的函数，并将其传递给路径生成器（原文：being passed the any arguments passed to the [path generator](#_path)）。例如，如果您的GeoJSON数据具有附加属性，则可以访问这些属性在pointRadius给定的函数中来改变点大小；或者，您可以使用[d3.symbol](https://github.com/d3/d3-shape#symbols)和[projection](#geoProjection)这两种更加灵活的方式。

### Projections

投影将球面多边形几何体转换为平面多边形几何体。D3提供了如下几类标准投影的实现：

* [Azimuthal](#azimuthal-projections)
* [Composite](#composite-projections)
* [Conic](#conic-projections)
* [Cylindrical](#cylindrical-projections)

有关更多投影，请参阅[d3-geo-projection](https://github.com/d3/d3-geo-projection)。您可以使用[custom projections](#raw-projections)或[d3.geoProjectionMutator](#geoProjectionMutator)实现自定义投影。

<a href="#_projection" name="_projection">#</a> <i>projection</i>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

返回表示给定*point*的投影后的点的新数组\[*x*, *y*\]（通常以像素为单位）。给定*point*必须为以度为单位的双元素数组\[*longitude*, *latitude*\]。如果给定的*point*没有定义的投影位置，例如当该点位于该投影的剪切边界之外时，将返回null 。

<a href="#projection_invert" name="projection_invert">#</a> <i>projection</i>.<b>invert</b>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

以度为单位返回一个以度为单位的新数组\[*longitude*, *latitude*\]，表示给定投影*point*的未投影点。该点必须给定为双元素数组\[*x*, *y*\]（通常以像素为单位）。如果给定的*point*没有定义的投影位置，例如当该点位于该投影的剪切边界之外时，将返回null 。

该方法仅定义在可逆投影上。

<a href="#projection_stream" name="projection_stream">#</a> <i>projection</i>.<b>stream</b>(<i>stream</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

返回给定输出*stream*的[projection stream](#streams)。任何输入的几何体都是先投影然后成为输出流。（原文：Any input geometry is projected before being streamed to the output stream.）典型的投影涉及多个几何变换：输入几何体首先转换为弧度，在三个轴上旋转，剪切到小圆或沿着反面子午线，最后通过自适应重采样、缩放和平移投影到平面。

<a href="#projection_preclip" name="projection_preclip">#</a> <i>projection</i>.<b>preclip</b>([<i>preclip</i>])

如果给定了*preclip*，则将投影的球面剪裁设置为给定的函数并返回投影。如果未给定*preclip*，则返回当前的球面剪裁功能（请参阅[preclip](#preclip)）。

<a href="#projection_postclip" name="projection_postclip">#</a> <i>projection</i>.<b>postclip</b>([<i>postclip</i>])

如果指定了*postclip*，则将投影的平面剪裁设置为指定的函数并返回投影。如果未指定*postclip*，则返回当前的平面剪切函数（请参阅[postclip](#postclip)）。

<a href="#projection_clipAngle" name="projection_clipAngle">#</a> <i>projection</i>.<b>clipAngle</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

如果指定了*angle*，则将投影的剪切圆半径设置为指定的以度为单位的角度并返回投影。（原文：If *angle* is specified, sets the projection’s clipping circle radius to the specified angle in degrees and returns the projection.）如果*angle*为null，则切换到[反面子午线切割](https://bl.ocks.org/mbostock/3788999)而不是小圆切割。如果未指定*angle*，则返回当前剪切角度，默认为null。小圆剪切独立于通过[*projection*.clipExtent](#projection_clipExtent)的视口剪切。

另见[*projection*.preclip](#projection_preclip)，[d3.geoClipAntimeridian](#geoClipAntimeridian)，[d3.geoClipCircle](#geoClipCircle)。

<a href="#projection_clipExtent" name="projection_clipExtent">#</a> <i>projection</i>.<b>clipExtent</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

If *extent* is specified, sets the projection’s viewport clip extent to the specified bounds in pixels and returns the projection. The *extent* bounds are specified as an array \[\[<i>x₀</i>, <i>y₀</i>\], \[<i>x₁</i>, <i>y₁</i>\]\], where <i>x₀</i> is the left-side of the viewport, <i>y₀</i> is the top, <i>x₁</i> is the right and <i>y₁</i> is the bottom. If *extent* is null, no viewport clipping is performed. If *extent* is not specified, returns the current viewport clip extent which defaults to null. Viewport clipping is independent of small-circle clipping via [*projection*.clipAngle](#projection_clipAngle).

See also [*projection*.postclip](#projection_postclip), [d3.geoClipRectangle](#geoClipRectangle).

<a href="#projection_scale" name="projection_scale">#</a> <i>projection</i>.<b>scale</b>([<i>scale</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

If *scale* is specified, sets the projection’s scale factor to the specified value and returns the projection. If *scale* is not specified, returns the current scale factor; the default scale is projection-specific. The scale factor corresponds linearly to the distance between projected points; however, absolute scale factors are not equivalent across projections.

<a href="#projection_translate" name="projection_translate">#</a> <i>projection</i>.<b>translate</b>([<i>translate</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

If *translate* is specified, sets the projection’s translation offset to the specified two-element array [<i>t<sub>x</sub></i>, <i>t<sub>y</sub></i>] and returns the projection. If *translate* is not specified, returns the current translation offset which defaults to [480, 250]. The translation offset determines the pixel coordinates of the projection’s [center](#projection_center). The default translation offset places ⟨0°,0°⟩ at the center of a 960×500 area.

<a href="#projection_center" name="projection_center">#</a> <i>projection</i>.<b>center</b>([<i>center</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

If *center* is specified, sets the projection’s center to the specified *center*, a two-element array of longitude and latitude in degrees and returns the projection. If *center* is not specified, returns the current center, which defaults to ⟨0°,0°⟩.

<a href="#projection_angle" name="projection_angle">#</a> <i>projection</i>.<b>angle</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

If *angle* is specified, sets the projection’s post-projection planar rotation angle to the specified *angle* in degrees and returns the projection. If *angle* is not specified, returns the projection’s current angle, which defaults to 0°. Note that it may be faster to rotate during rendering (e.g., using [*context*.rotate](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/rotate)) rather than during projection.

<a href="#projection_rotate" name="projection_rotate">#</a> <i>projection</i>.<b>rotate</b>([<i>angles</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

If *rotation* is specified, sets the projection’s [three-axis spherical rotation](https://bl.ocks.org/mbostock/4282586) to the specified *angles*, which must be a two- or three-element array of numbers [*lambda*, *phi*, *gamma*] specifying the rotation angles in degrees about [each spherical axis](https://bl.ocks.org/mbostock/4282586). (These correspond to [yaw, pitch and roll](http://en.wikipedia.org/wiki/Aircraft_principal_axes).) If the rotation angle *gamma* is omitted, it defaults to 0. See also [d3.geoRotation](#geoRotation). If *rotation* is not specified, returns the current rotation which defaults [0, 0, 0].

<a href="#projection_precision" name="projection_precision">#</a> <i>projection</i>.<b>precision</b>([<i>precision</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

If *precision* is specified, sets the threshold for the projection’s [adaptive resampling](https://bl.ocks.org/mbostock/3795544) to the specified value in pixels and returns the projection. This value corresponds to the [Douglas–Peucker](http://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm) distance. If *precision* is not specified, returns the projection’s current resampling precision which defaults to √0.5 ≅ 0.70710…

<a href="#projection_fitExtent" name="projection_fitExtent">#</a> <i>projection</i>.<b>fitExtent</b>(<i>extent</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

Sets the projection’s [scale](#projection_scale) and [translate](#projection_translate) to fit the specified GeoJSON *object* in the center of the given *extent*. The extent is specified as an array \[\[x₀, y₀\], \[x₁, y₁\]\], where x₀ is the left side of the bounding box, y₀ is the top, x₁ is the right and y₁ is the bottom. Returns the projection.

For example, to scale and translate the [New Jersey State Plane projection](https://bl.ocks.org/mbostock/5126418) to fit a GeoJSON object *nj* in the center of a 960×500 bounding box with 20 pixels of padding on each side:

```js
var projection = d3.geoTransverseMercator()
    .rotate([74 + 30 / 60, -38 - 50 / 60])
    .fitExtent([[20, 20], [940, 480]], nj);
```

Any [clip extent](#projection_clipExtent) is ignored when determining the new scale and translate. The [precision](#projection_precision) used to compute the bounding box of the given *object* is computed at an effective scale of 150.

<a href="#projection_fitSize" name="projection_fitSize">#</a> <i>projection</i>.<b>fitSize</b>(<i>size</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

A convenience method for [*projection*.fitExtent](#projection_fitExtent) where the top-left corner of the extent is [0, 0]. The following two statements are equivalent:

```js
projection.fitExtent([[0, 0], [width, height]], object);
projection.fitSize([width, height], object);
```

<a href="#projection_fitWidth" name="projection_fitWidth">#</a> <i>projection</i>.<b>fitWidth</b>(<i>width</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

A convenience method for [*projection*.fitSize](#projection_fitSize) where the height is automatically chosen from the aspect ratio of *object* and the given constraint on *width*.

<a href="#projection_fitHeight" name="projection_fitHeight">#</a> <i>projection</i>.<b>fitHeight</b>(<i>height</i>, <i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

A convenience method for [*projection*.fitSize](#projection_fitSize) where the width is automatically chosen from the aspect ratio of *object* and the given contraint on *height*.

#### Azimuthal Projections

Azimuthal projections project the sphere directly onto a plane.

<a href="#geoAzimuthalEqualArea" name="geoAzimuthalEqualArea">#</a> d3.<b>geoAzimuthalEqualArea</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/azimuthalEqualArea.js "Source")
<br><a href="#geoAzimuthalEqualAreaRaw" name="geoAzimuthalEqualAreaRaw">#</a> d3.<b>geoAzimuthalEqualAreaRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/azimuthalEqualArea.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757101)

The azimuthal equal-area projection.

<a href="#geoAzimuthalEquidistant" name="geoAzimuthalEquidistant">#</a> d3.<b>geoAzimuthalEquidistant</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/azimuthalEquidistant.js "Source")
<br><a href="#geoAzimuthalEquidistantRaw" name="geoAzimuthalEquidistantRaw">#</a> d3.<b>geoAzimuthalEquidistantRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/azimuthalEquidistant.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757110)

The azimuthal equidistant projection.

<a href="#geoGnomonic" name="geoGnomonic">#</a> d3.<b>geoGnomonic</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/gnomonic.js "Source")
<br><a href="#geoGnomonicRaw" name="geoGnomonicRaw">#</a> d3.<b>geoGnomonicRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/gnomonic.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757349)

The gnomonic projection.

<a href="#geoOrthographic" name="geoOrthographic">#</a> d3.<b>geoOrthographic</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/orthographic.js "Source")
<br><a href="#geoOrthographicRaw" name="geoOrthographicRaw">#</a> d3.<b>geoOrthographicRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/orthographic.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757125)

The orthographic projection.

<a href="#geoStereographic" name="geoStereographic">#</a> d3.<b>geoStereographic</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/stereographic.js "Source")
<br><a href="#geoStereographicRaw" name="geoStereographicRaw">#</a> d3.<b>geoStereographicRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/stereographic.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757137)

The stereographic projection.

#### Equal-Earth

<a href="#geoEqualEarth" name="geoEqualEarth">#</a> d3.<b>geoEqualEarth</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/equalEarth.js "Source")
<br><a href="#geoEqualEarthRaw" name="geoEqualEarthRaw">#</a> d3.<b>geoEqualEarthRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/equalEarth.png" width="480" height="250">](http://shadedrelief.com/ee_proj/)

The Equal Earth projection, by Bojan Šavrič _et al._, 2018.

#### Composite Projections

Composite consist of several projections that are composed into a single display. The constituent projections have fixed clip, center and rotation, and thus composite projections do not support [*projection*.center](#projection_center), [*projection*.rotate](#projection_rotate), [*projection*.clipAngle](#projection_clipAngle), or [*projection*.clipExtent](#projection_clipExtent).

<a href="#geoAlbersUsa" name="geoAlbersUsa">#</a> d3.<b>geoAlbersUsa</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/albersUsa.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/albersUsa.png" width="480" height="250">](https://bl.ocks.org/mbostock/4090848)

This is a U.S.-centric composite projection of three [d3.geoConicEqualArea](#geoConicEqualArea) projections: [d3.geoAlbers](#geoAlbers) is used for the lower forty-eight states, and separate conic equal-area projections are used for Alaska and Hawaii. Note that the scale for Alaska is diminished: it is projected at 0.35× its true relative area. This diagram by Philippe Rivière illustrates how this projection uses two rectangular insets for Alaska and Hawaii:

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/albersUsa-parameters.png" width="480" height="250">](https://bl.ocks.org/Fil/7723167596af40d9159be34ffbf8d36b)

See [d3-composite-projections](http://geoexamples.com/d3-composite-projections/) for more examples.

#### Conic Projections

Conic projections project the sphere onto a cone, and then unroll the cone onto the plane. Conic projections have [two standard parallels](#conic_parallels).

<a href="#conic_parallels" name="conic_parallels">#</a> <i>conic</i>.<b>parallels</b>([<i>parallels</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conic.js "Source")

The [two standard parallels](https://en.wikipedia.org/wiki/Map_projection#Conic) that define the map layout in conic projections.

<a href="#geoAlbers" name="geoAlbers">#</a> d3.<b>geoAlbers</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/albers.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/albers.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734308)

The Albers’ equal area-conic projection. This is a U.S.-centric configuration of [d3.geoConicEqualArea](#geoConicEqualArea).

<a href="#geoConicConformal" name="geoConicConformal">#</a> d3.<b>geoConicConformal</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicConformal.js "Source")
<br><a href="#geoConicConformalRaw" name="geoConicConformalRaw">#</a> d3.<b>geoConicConformalRaw</b>(<i>phi0</i>, <i>phi1</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicConformal.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/conicConformal.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734321)

The conic conformal projection. The parallels default to [30°, 30°] resulting in flat top. See also [*conic*.parallels](#conic_parallels).

<a href="#geoConicEqualArea" name="geoConicEqualArea">#</a> d3.<b>geoConicEqualArea</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEqualArea.js "Source")
<br><a href="#geoConicEqualAreaRaw" name="geoConicEqualAreaRaw">#</a> d3.<b>geoConicEqualAreaRaw</b>(<i>phi0</i>, <i>phi1</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEqualArea.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/conicEqualArea.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734308)

The Albers’ equal-area conic projection. See also [*conic*.parallels](#conic_parallels).

<a href="#geoConicEquidistant" name="geoConicEquidistant">#</a> d3.<b>geoConicEquidistant</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEquidistant.js "Source")
<br><a href="#geoConicEquidistantRaw" name="geoConicEquidistantRaw">#</a> d3.<b>geoConicEquidistantRaw</b>(<i>phi0</i>, <i>phi1</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/conicEquidistant.js "Source")

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/conicEquidistant.png" width="480" height="250">](https://bl.ocks.org/mbostock/3734317)

The conic equidistant projection. See also [*conic*.parallels](#conic_parallels).

#### Cylindrical Projections

Cylindrical projections project the sphere onto a containing cylinder, and then unroll the cylinder onto the plane. [Pseudocylindrical projections](http://www.progonos.com/furuti/MapProj/Normal/ProjPCyl/projPCyl.html) are a generalization of cylindrical projections.

<a href="#geoEquirectangular" name="geoEquirectangular">#</a> d3.<b>geoEquirectangular</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/equirectangular.js "Source")
<br><a href="#geoEquirectangularRaw" name="geoEquirectangularRaw">#</a> d3.<b>geoEquirectangularRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/equirectangular.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757119)

The equirectangular (plate carrée) projection.

<a href="#geoMercator" name="geoMercator">#</a> d3.<b>geoMercator</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/mercator.js "Source")
<br><a href="#geoMercatorRaw" name="geoMercatorRaw">#</a> d3.<b>geoMercatorRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/mercator.png" width="480" height="250">](https://bl.ocks.org/mbostock/3757132)

The spherical Mercator projection. Defines a default [*projection*.clipExtent](#projection_clipExtent) such that the world is projected to a square, clipped to approximately ±85° latitude.

<a href="#geoTransverseMercator" name="geoTransverseMercator">#</a> d3.<b>geoTransverseMercator</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/transverseMercator.js "Source")
<br><a href="#geoTransverseMercatorRaw" name="geoTransverseMercatorRaw">#</a> d3.<b>geoTransverseMercatorRaw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/transverseMercator.png" width="480" height="250">](https://bl.ocks.org/mbostock/4695821)

The transverse spherical Mercator projection. Defines a default [*projection*.clipExtent](#projection_clipExtent) such that the world is projected to a square, clipped to approximately ±85° latitude.

<a href="#geoNaturalEarth1" name="geoNaturalEarth1">#</a> d3.<b>geoNaturalEarth1</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/projection/naturalEarth1.js "Source")
<br><a href="#geoNaturalEarth1Raw" name="geoNaturalEarth1Raw">#</a> d3.<b>geoNaturalEarth1Raw</b>

[<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/naturalEarth1.png" width="480" height="250">](https://bl.ocks.org/mbostock/4479477)

The [Natural Earth projection](http://www.shadedrelief.com/NE_proj/) is a pseudocylindrical projection designed by Tom Patterson. It is neither conformal nor equal-area, but appealing to the eye for small-scale maps of the whole world.

### Raw Projections

Raw projections are point transformation functions that are used to implement custom projections; they typically passed to [d3.geoProjection](#geoProjection) or [d3.geoProjectionMutator](#geoProjectionMutator). They are exposed here to facilitate the derivation of related projections. Raw projections take spherical coordinates \[*lambda*, *phi*\] in radians (not degrees!) and return a point \[*x*, *y*\], typically in the unit square centered around the origin.

<a href="#_project" name="_project">#</a> <i>project</i>(<i>lambda</i>, <i>phi</i>)

Projects the specified point [<i>lambda</i>, <i>phi</i>] in radians, returning a new point \[*x*, *y*\] in unitless coordinates.

<a href="#project_invert" name="project_invert">#</a> <i>project</i>.<b>invert</b>(<i>x</i>, <i>y</i>)

The inverse of [*project*](#_project).

<a href="#geoProjection" name="geoProjection">#</a> d3.<b>geoProjection</b>(<i>project</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

Constructs a new projection from the specified [raw projection](#_project), *project*. The *project* function takes the *longitude* and *latitude* of a given point in [radians](http://mathworld.wolfram.com/Radian.html), often referred to as *lambda* (λ) and *phi* (φ), and returns a two-element array \[*x*, *y*\] representing its unit projection. The *project* function does not need to scale or translate the point, as these are applied automatically by [*projection*.scale](#projection_scale), [*projection*.translate](#projection_translate), and [*projection*.center](#projection_center). Likewise, the *project* function does not need to perform any spherical rotation, as [*projection*.rotate](#projection_rotate) is applied prior to projection.

For example, a spherical Mercator projection can be implemented as:

```js
var mercator = d3.geoProjection(function(x, y) {
  return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
});
```

If the *project* function exposes an *invert* method, the returned projection will also expose [*projection*.invert](#projection_invert).

<a href="#geoProjectionMutator" name="geoProjectionMutator">#</a> d3.<b>geoProjectionMutator</b>(<i>factory</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/projection/index.js "Source")

Constructs a new projection from the specified [raw projection](#_project) *factory* and returns a *mutate* function to call whenever the raw projection changes. The *factory* must return a raw projection. The returned *mutate* function returns the wrapped projection. For example, a conic projection typically has two configurable parallels. A suitable *factory* function, such as [d3.geoConicEqualAreaRaw](#geoConicEqualAreaRaw), would have the form:

```js
// y0 and y1 represent two parallels
function conicFactory(phi0, phi1) {
  return function conicRaw(lambda, phi) {
    return […, …];
  };
}
```

Using d3.geoProjectionMutator, you can implement a standard projection that allows the parallels to be changed, reassigning the raw projection used internally by [d3.geoProjection](#geoProjection):

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

When creating a mutable projection, the *mutate* function is typically not exposed.

### Spherical Math

<a name="geoArea" href="#geoArea">#</a> d3.<b>geoArea</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/area.js "Source")

Returns the spherical area of the specified GeoJSON *object* in [steradians](http://mathworld.wolfram.com/Steradian.html). This is the spherical equivalent of [*path*.area](#path_area).

<a name="geoBounds" href="#geoBounds">#</a> d3.<b>geoBounds</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/bounds.js "Source")

Returns the [spherical bounding box](https://www.jasondavies.com/maps/bounds/) for the specified GeoJSON *object*. The bounding box is represented by a two-dimensional array: \[\[*left*, *bottom*], \[*right*, *top*\]\], where *left* is the minimum longitude, *bottom* is the minimum latitude, *right* is maximum longitude, and *top* is the maximum latitude. All coordinates are given in degrees. (Note that in projected planar coordinates, the minimum latitude is typically the maximum *y*-value, and the maximum latitude is typically the minimum *y*-value.) This is the spherical equivalent of [*path*.bounds](#path_bounds).

<a name="geoCentroid" href="#geoCentroid">#</a> d3.<b>geoCentroid</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/centroid.js "Source")

Returns the spherical centroid of the specified GeoJSON *object*. This is the spherical equivalent of [*path*.centroid](#path_centroid).

<a name="geoDistance" href="#geoDistance">#</a> d3.<b>geoDistance</b>(<i>a</i>, <i>b</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/distance.js "Source")

Returns the great-arc distance in [radians](http://mathworld.wolfram.com/Radian.html) between the two points *a* and *b*. Each point must be specified as a two-element array \[*longitude*, *latitude*\] in degrees. This is the spherical equivalent of [*path*.measure](#path_measure) given a LineString of two points.

<a name="geoLength" href="#geoLength">#</a> d3.<b>geoLength</b>(<i>object</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/length.js "Source")

Returns the great-arc length of the specified GeoJSON *object* in [radians](http://mathworld.wolfram.com/Radian.html). For polygons, returns the perimeter of the exterior ring plus that of any interior rings. This is the spherical equivalent of [*path*.measure](#path_measure).

<a name="geoInterpolate" href="#geoInterpolate">#</a> d3.<b>geoInterpolate</b>(<i>a</i>, <i>b</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/interpolate.js "Source")

Returns an interpolator function given two points *a* and *b*. Each point must be specified as a two-element array \[*longitude*, *latitude*\] in degrees. The returned interpolator function takes a single argument *t*, where *t* is a number ranging from 0 to 1; a value of 0 returns the point *a*, while a value of 1 returns the point *b*. Intermediate values interpolate from *a* to *b* along the great arc that passes through both *a* and *b*. If *a* and *b* are antipodes, an arbitrary great arc is chosen.

<a name="geoContains" href="#geoContains">#</a> d3.<b>geoContains</b>(<i>object</i>, <i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/contains.js "Source")

Returns true if and only if the specified GeoJSON *object* contains the specified *point*, or false if the *object* does not contain the *point*. The point must be specified as a two-element array \[*longitude*, *latitude*\] in degrees. For Point and MultiPoint geometries, an exact test is used; for a Sphere, true is always returned; for other geometries, an epsilon threshold is applied.

<a name="geoRotation" href="#geoRotation">#</a> d3.<b>geoRotation</b>(<i>angles</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/rotation.js "Source")

Returns a [rotation function](#_rotation) for the given *angles*, which must be a two- or three-element array of numbers [*lambda*, *phi*, *gamma*] specifying the rotation angles in degrees about [each spherical axis](https://bl.ocks.org/mbostock/4282586). (These correspond to [yaw, pitch and roll](http://en.wikipedia.org/wiki/Aircraft_principal_axes).) If the rotation angle *gamma* is omitted, it defaults to 0. See also [*projection*.rotate](#projection_rotate).

<a name="_rotation" href="#_rotation">#</a> <i>rotation</i>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/rotation.js "Source")

Returns a new array \[*longitude*, *latitude*\] in degrees representing the rotated point of the given *point*. The point must be specified as a two-element array \[*longitude*, *latitude*\] in degrees.

<a name="rotation_invert" href="#rotation_invert">#</a> <i>rotation</i>.<b>invert</b>(<i>point</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/rotation.js "Source")

Returns a new array \[*longitude*, *latitude*\] in degrees representing the point of the given rotated *point*; the inverse of [*rotation*](#_rotation). The point must be specified as a two-element array \[*longitude*, *latitude*\] in degrees.

### Spherical Shapes

To generate a [great arc](https://en.wikipedia.org/wiki/Great-circle_distance) (a segment of a great circle), simply pass a GeoJSON LineString geometry object to a [d3.geoPath](#geoPath). D3’s projections use great-arc interpolation for intermediate points, so there’s no need for a great arc shape generator.

<a name="geoCircle" href="#geoCircle">#</a> d3.<b>geoCircle</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

Returns a new circle generator.

<a name="_circle" href="#_circle">#</a> <i>circle</i>(<i>arguments…</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

Returns a new GeoJSON geometry object of type “Polygon” approximating a circle on the surface of a sphere, with the current [center](#circle_center), [radius](#circle_radius) and [precision](#circle_precision). Any *arguments* are passed to the accessors.

<a name="circle_center" href="#circle_center">#</a> <i>circle</i>.<b>center</b>([<i>center</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

If *center* is specified, sets the circle center to the specified point \[*longitude*, *latitude*\] in degrees, and returns this circle generator. The center may also be specified as a function; this function will be invoked whenever a circle is [generated](#_circle), being passed any arguments passed to the circle generator. If *center* is not specified, returns the current center accessor, which defaults to:

```js
function center() {
  return [0, 0];
}
```

<a name="circle_radius" href="#circle_radius">#</a> <i>circle</i>.<b>radius</b>([<i>radius</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

If *radius* is specified, sets the circle radius to the specified angle in degrees, and returns this circle generator. The radius may also be specified as a function; this function will be invoked whenever a circle is [generated](#_circle), being passed any arguments passed to the circle generator. If *radius* is not specified, returns the current radius accessor, which defaults to:

```js
function radius() {
  return 90;
}
```

<a name="circle_precision" href="#circle_precision">#</a> <i>circle</i>.<b>precision</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/circle.js "Source")

If *precision* is specified, sets the circle precision to the specified angle in degrees, and returns this circle generator. The precision may also be specified as a function; this function will be invoked whenever a circle is [generated](#_circle), being passed any arguments passed to the circle generator. If *precision* is not specified, returns the current precision accessor, which defaults to:

```js
function precision() {
  return 6;
}
```

Small circles do not follow great arcs and thus the generated polygon is only an approximation. Specifying a smaller precision angle improves the accuracy of the approximate polygon, but also increase the cost to generate and render it.

<a name="geoGraticule" href="#geoGraticule">#</a> d3.<b>geoGraticule</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

Constructs a geometry generator for creating graticules: a uniform grid of [meridians](https://en.wikipedia.org/wiki/Meridian_\(geography\)) and [parallels](https://en.wikipedia.org/wiki/Circle_of_latitude) for showing projection distortion. The default graticule has meridians and parallels every 10° between ±80° latitude; for the polar regions, there are meridians every 90°.

<img src="https://raw.githubusercontent.com/d3/d3-geo/master/img/graticule.png" width="480" height="360">

<a name="_graticule" href="#_graticule">#</a> <i>graticule</i>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

Returns a GeoJSON MultiLineString geometry object representing all meridians and parallels for this graticule.

<a name="graticule_lines" href="#graticule_lines">#</a> <i>graticule</i>.<b>lines</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

Returns an array of GeoJSON LineString geometry objects, one for each meridian or parallel for this graticule.

<a name="graticule_outline" href="#graticule_outline">#</a> <i>graticule</i>.<b>outline</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

Returns a GeoJSON Polygon geometry object representing the outline of this graticule, i.e. along the meridians and parallels defining its extent.

<a name="graticule_extent" href="#graticule_extent">#</a> <i>graticule</i>.<b>extent</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

If *extent* is specified, sets the major and minor extents of this graticule. If *extent* is not specified, returns the current minor extent, which defaults to ⟨⟨-180°, -80° - ε⟩, ⟨180°, 80° + ε⟩⟩.

<a name="graticule_extentMajor" href="#graticule_extentMajor">#</a> <i>graticule</i>.<b>extentMajor</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

If *extent* is specified, sets the major extent of this graticule. If *extent* is not specified, returns the current major extent, which defaults to ⟨⟨-180°, -90° + ε⟩, ⟨180°, 90° - ε⟩⟩.

<a name="graticule_extentMinor" href="#graticule_extentMinor">#</a> <i>graticule</i>.<b>extentMinor</b>([<i>extent</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

If *extent* is specified, sets the minor extent of this graticule. If *extent* is not specified, returns the current minor extent, which defaults to ⟨⟨-180°, -80° - ε⟩, ⟨180°, 80° + ε⟩⟩.

<a name="graticule_step" href="#graticule_step">#</a> <i>graticule</i>.<b>step</b>([<i>step</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

If *step* is specified, sets the major and minor step for this graticule. If *step* is not specified, returns the current minor step, which defaults to ⟨10°, 10°⟩.

<a name="graticule_stepMajor" href="#graticule_stepMajor">#</a> <i>graticule</i>.<b>stepMajor</b>([<i>step</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

If *step* is specified, sets the major step for this graticule. If *step* is not specified, returns the current major step, which defaults to ⟨90°, 360°⟩.

<a name="graticule_stepMinor" href="#graticule_stepMinor">#</a> <i>graticule</i>.<b>stepMinor</b>([<i>step</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

If *step* is specified, sets the minor step for this graticule. If *step* is not specified, returns the current minor step, which defaults to ⟨10°, 10°⟩.

<a name="graticule_precision" href="#graticule_precision">#</a> <i>graticule</i>.<b>precision</b>([<i>angle</i>]) [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

If *precision* is specified, sets the precision for this graticule, in degrees. If *precision* is not specified, returns the current precision, which defaults to 2.5°.

<a name="geoGraticule10" href="#geoGraticule10">#</a> d3.<b>geoGraticule10</b>() [<>](https://github.com/d3/d3-geo/blob/master/src/graticule.js "Source")

A convenience method for directly generating the default 10° global graticule as a GeoJSON MultiLineString geometry object. Equivalent to:

```js
function geoGraticule10() {
  return d3.geoGraticule()();
}
```

### Streams

D3 transforms geometry using a sequence of function calls, rather than materializing intermediate representations, to minimize overhead. Streams must implement several methods to receive input geometry. Streams are inherently stateful; the meaning of a [point](#point) depends on whether the point is inside of a [line](#lineStart), and likewise a line is distinguished from a ring by a [polygon](#polygonStart). Despite the name “stream”, these method calls are currently synchronous.

<a href="#geoStream" name="geoStream">#</a> d3.<b>geoStream</b>(<i>object</i>, <i>stream</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/stream.js "Source")

Streams the specified [GeoJSON](http://geojson.org) *object* to the specified [projection *stream*](#projection-streams). While both features and geometry objects are supported as input, the stream interface only describes the geometry, and thus additional feature properties are not visible to streams.

<a name="stream_point" href="#stream_point">#</a> <i>stream</i>.<b>point</b>(<i>x</i>, <i>y</i>[, <i>z</i>])

Indicates a point with the specified coordinates *x* and *y* (and optionally *z*). The coordinate system is unspecified and implementation-dependent; for example, [projection streams](https://github.com/d3/d3-geo-projection) require spherical coordinates in degrees as input. Outside the context of a polygon or line, a point indicates a point geometry object ([Point](http://www.geojson.org/geojson-spec.html#point) or [MultiPoint](http://www.geojson.org/geojson-spec.html#multipoint)). Within a line or polygon ring, the point indicates a control point.

<a name="stream_lineStart" href="#stream_lineStart">#</a> <i>stream</i>.<b>lineStart</b>()

Indicates the start of a line or ring. Within a polygon, indicates the start of a ring. The first ring of a polygon is the exterior ring, and is typically clockwise. Any subsequent rings indicate holes in the polygon, and are typically counterclockwise.

<a name="stream_lineEnd" href="#stream_lineEnd">#</a> <i>stream</i>.<b>lineEnd</b>()

Indicates the end of a line or ring. Within a polygon, indicates the end of a ring. Unlike GeoJSON, the redundant closing coordinate of a ring is *not* indicated via [point](#point), and instead is implied via lineEnd within a polygon. Thus, the given polygon input:

```json
{
  "type": "Polygon",
  "coordinates": [
    [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]
  ]
}
```

Will produce the following series of method calls on the stream:

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

Indicates the start of a polygon. The first line of a polygon indicates the exterior ring, and any subsequent lines indicate interior holes.

<a name="stream_polygonEnd" href="#stream_polygonEnd">#</a> <i>stream</i>.<b>polygonEnd</b>()

Indicates the end of a polygon.

<a name="stream_sphere" href="#stream_sphere">#</a> <i>stream</i>.<b>sphere</b>()

Indicates the sphere (the globe; the unit sphere centered at ⟨0,0,0⟩).

### Transforms

Transforms are a generalization of projections. Transform implement [*projection*.stream](#projection_stream) and can be passed to [*path*.projection](#path_projection). However, they only implement a subset of the other projection methods, and represent arbitrary geometric transformations rather than projections from spherical to planar coordinates.

<a href="#geoTransform" name="geoTransform">#</a> d3.<b>geoTransform</b>(<i>methods</i>) [<>](https://github.com/d3/d3-geo/blob/master/src/transform.js "Source")

Defines an arbitrary transform using the methods defined on the specified *methods* object. Any undefined methods will use pass-through methods that propagate inputs to the output stream. For example, to reflect the *y*-dimension (see also [*identity*.reflectY](#identity_reflectY)):

```js
var reflectY = d3.geoTransform({
  point: function(x, y) {
    this.stream.point(x, -y);
  }
});
```

Or to define an affine matrix transformation:

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

The identity transform can be used to scale, translate and clip planar geometry. It implements [*projection*.scale](#projection_scale), [*projection*.translate](#projection_translate), [*projection*.fitExtent](#projection_fitExtent), [*projection*.fitSize](#projection_fitSize), [*projection*.fitWidth](#projection_fitWidth), [*projection*.fitHeight](#projection_fitHeight) and [*projection*.clipExtent](#projection_clipExtent).

<a href="#identity_reflectX" name="identity_reflectX">#</a> <i>identity</i>.<b>reflectX</b>([<i>reflect</i>])

If *reflect* is specified, sets whether or not the *x*-dimension is reflected (negated) in the output. If *reflect* is not specified, returns true if *x*-reflection is enabled, which defaults to false.

<a href="#identity_reflectY" name="identity_reflectY">#</a> <i>identity</i>.<b>reflectY</b>([<i>reflect</i>])

If *reflect* is specified, sets whether or not the *y*-dimension is reflected (negated) in the output. If *reflect* is not specified, returns true if *y*-reflection is enabled, which defaults to false. This is especially useful for transforming from standard [spatial reference systems](https://en.wikipedia.org/wiki/Spatial_reference_system), which treat positive *y* as pointing up, to display coordinate systems such as Canvas and SVG, which treat positive *y* as pointing down.

### Clipping

Projections perform cutting or clipping of geometries in two stages.

<a name="preclip" href="#preclip">#</a> <i>preclip</i>(<i>stream</i>)

Pre-clipping occurs in geographic coordinates. Cutting along the antimeridian line, or clipping along a small circle are the most common strategies.

See [*projection*.preclip](#projection_preclip).

<a name="postclip" href="#postclip">#</a> <i>postclip</i>(<i>stream</i>)

Post-clipping occurs on the plane, when a projection is bounded to a certain extent such as a rectangle.

See [*projection*.postclip](#projection_postclip).

Clipping functions are implemented as transformations of a [projection stream](#streams). Pre-clipping operates on spherical coordinates, in radians. Post-clipping operates on planar coordinates, in pixels.

<a name="geoClipAntimeridian" href="#geoClipAntimeridian">#</a> d3.<b>geoClipAntimeridian</b>

A clipping function which transforms a stream such that geometries (lines or polygons) that cross the antimeridian line are cut in two, one on each side. Typically used for pre-clipping.

<a name="geoClipCircle" href="#geoClipCircle">#</a> d3.<b>geoClipCircle</b>(<i>angle</i>)

Generates a clipping function which transforms a stream such that geometries are bounded by a small circle of radius *angle* around the projection’s [center](#projection_center). Typically used for pre-clipping.

<a name="geoClipRectangle" href="#geoClipRectangle">#</a> d3.<b>geoClipRectangle</b>(<i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>)

Generates a clipping function which transforms a stream such that geometries are bounded by a rectangle of coordinates [[<i>x0</i>, <i>y0</i>], [<i>x1</i>, <i>y1</i>]]. Typically used for post-clipping.
