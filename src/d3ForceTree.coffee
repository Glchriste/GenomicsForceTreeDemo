StaticHolder = ->
  unless StaticHolder.ranges
    StaticHolder.ranges = {}
    StaticHolder.ordinalScales = {}
    StaticHolder.colorScales = {}
    StaticHolder.labelCheckBoxes = []
    StaticHolder.counter = 0
    StaticHolder.goObjects = {}
    StaticHolder.nodes = null
    StaticHolder.root = null
    StaticHolder.highlightedNode = null
    StaticHolder.maxLevel = -1
    StaticHolder.highlightReverse = false
  @setMaxLevel = (aLevel) ->
    StaticHolder.maxLevel = aLevel

  @getHighlightReverse = ->
    StaticHolder.highlightReverse

  @setHighlightReverse = (b) ->
    StaticHolder.highlightReverse = b

  @getMaxLevel = ->
    StaticHolder.maxLevel

  @getNodes = ->
    StaticHolder.nodes

  @getHighlightedNode = ->
    StaticHolder.highlightedNode

  @setHighlightedNode = (aNode) ->
    StaticHolder.highlightedNode = aNode

  @getRoot = ->
    StaticHolder.root

  @setRoot = (aRoot) ->
    StaticHolder.root = aRoot

  @setNodes = (someNodes) ->
    StaticHolder.nodes = someNodes

  @getRanges = ->
    StaticHolder.ranges

  @getOrdinalScales = ->
    StaticHolder.ordinalScales

  @getColorScales = ->
    StaticHolder.colorScales

  @getLabelCheckBoxes = ->
    StaticHolder.labelCheckBoxes

  @addGoObject = (goObject) ->
    StaticHolder.counter++
    StaticHolder.goObjects[StaticHolder.counter] = goObject
    StaticHolder.counter

  @getGoObjects = ->
    StaticHolder.goObjects

# modded from http://dotnetprof.blogspot.com/2012/11/get-querystring-values-using-javascript.html
getQueryStrings = (aWindow) ->
  
  #Holds key:value pairs
  queryStringColl = null
  
  #Get querystring from url
  requestUrl = aWindow.location.search.toString()
  unless requestUrl is ""
    requestUrl = requestUrl.substring(1)
    queryStringColl = {}
    
    #Get key:value pairs from querystring
    kvPairs = requestUrl.split("&")
    i = 0

    while i < kvPairs.length
      kvPair = kvPairs[i].split("=")
      queryStringColl[kvPair[0]] = kvPair[1]
      i++
  queryStringColl
GO = (parentWindow, thisWindow, isRunFromTopWindow) ->
  aDocument = parentWindow.document
  thisDocument = thisWindow.document
  statics = parentWindow.statics
  thisID = statics.addGoObject(this)
  graphType = "ForceTree"
  queryStrings = getQueryStrings(thisWindow)
  addNoise = false
  firstNoise = true
  dataNames = []
  lastSelected = null
  animationOn = false
  stopOnChild = false
  displayDataset = null
  dragging = false
  @addNoise = ->
    addNoise = true
    @redrawScreen()

  @getThisDocument = ->
    thisDocument

  @getParentDocument = ->
    aDocument

  if queryStrings
    aGraphType = queryStrings["GraphType"]
    graphType = aGraphType  if aGraphType?
  @resort = ->
    compareChoice = aDocument.getElementById("sortByWhat").value
    quantitativeSort = (a, b) ->
      return -1  if 1.0 * a[compareChoice] < 1.0 * b[compareChoice]
      return 1  if 1.0 * a[compareChoice] > 1.0 * b[compareChoice]
      0

    nonQuantitativeSort = (a, b) ->
      return -1  if a[compareChoice] < b[compareChoice]
      return 1  if a[compareChoice] > b[compareChoice]
      0

    unless aDocument.getElementById("treeAwareSort").checked
      
      # quantiative
      if statics.getRanges()[compareChoice]?
        nodes.sort quantitativeSort
      else
        nodes.sort nonQuantitativeSort
    else
      newNodes = []
      addNodeAndSortDaughters = (aNode) ->
        newNodes.push aNode
        return  if not aNode.children or aNode.children.length is 0
        childrenNodes = []
        x = 0

        while x < aNode.children.length
          childrenNodes.push aNode.children[x]
          x++
        
        # quantiative
        if statics.getRanges()[compareChoice]?
          childrenNodes.sort quantitativeSort
        else
          childrenNodes.sort nonQuantitativeSort
        x = 0

        while x < childrenNodes.length
          addNodeAndSortDaughters childrenNodes[x]
          x++

      addNodeAndSortDaughters statics.getRoot()
      nodes = newNodes
      statics.setNodes newNodes
    x = 0

    while x < nodes.length
      nodes[x].listPosition = x
      x++
    @setInitialPositions()
    @redrawScreen()

  
  # modded from http://mbostock.github.com/d3/talk/20111116/force-collapsible.html
  w = undefined
  h = undefined
  links = undefined
  link = undefined
  thisContext = this
  firstUpdate = true
  initHasRun = false
  topNodes = []
  dirty = true
  circleDraws = {}
  force = undefined
  drag = undefined
  vis = undefined
  @makeDirty = ->
    @dirty = true

  @reforce = ->
    @setWidthAndHeight()
    if graphType is "ForceTree"
      force = d3.layout.force().charge((d) ->
        (if d._children then -d.numSeqs / 100 else -30)
      ).linkDistance((d) ->
        (if d.target._children then 80 * (d.nodeDepth - 16) / 16 else 30)
      ).size([w, h - 60]).gravity(aDocument.getElementById("gravitySlider").value / 100)
      drag = force.drag().on("dragstart", (d) ->
        d.fixed = true
        d.userMoved = true
        dragging = true
        force.start()
      )
      drag = force.drag().on("drag", (d) ->
        dragging = true
        force.start()
      )
      drag = force.drag().on("dragend", (d) ->
        d.fixed = true
        d.userMoved = true
        d.parentDataNode.xMap[thisID] = d.x
        d.parentDataNode.yMap[thisID] = d.y
      )
      force.start()
      stopOnChild = true
    unless graphType is "ForceTree"
      vis = d3.select("body").append("svg:svg").attr("width", w).attr("height", h)
    
    #.append("g").call(d3.behavior.zoom().scaleExtent([0.01, 100]).on("zoom", thisContext.zoom))
    #.append("g");
    else
      vis = d3.select("body").append("svg:svg").attr("width", w).attr("height", h)

  
  # from http://blog.luzid.com/2013/extending-the-d3-zoomable-sunburst-with-labels/
  @computeTextRotation = (d) ->
    angle = x(d.x + d.dx / 2) - Math.PI / 2
    angle / Math.PI * 180

  @zoom = ->
    vis.attr "transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"
    thisContext.redrawScreen()

  @getDisplayDataset = ->
    addAndReturnChild = (aNode, childIndex) ->
      newChildNode = aNode.children[childIndex]
      newDisplayNode = {}
      newDisplayNode.name = "NAME_" + index
      index++
      newDisplayNode.fixed = true
      displayDataset.nodes.push newDisplayNode
      newDisplayNode.parentDataNode = newChildNode
      if newChildNode.children
        newDisplayNode.children = []
        x = 0

        while x < newChildNode.children.length
          newDisplayNode.children.push addAndReturnChild(newChildNode, x)
          x++
      newDisplayNode
    return displayDataset  if displayDataset
    displayDataset = nodes: []
    index = 0
    rootDisplayNode = {}
    rootDisplayNode.name = "NAME_" + index
    index++
    rootDisplayNode.fixed = false
    displayDataset.nodes.push rootDisplayNode
    rootDisplayNode.parentDataNode = statics.getRoot()
    rootDisplayNode.children = []
    x = 0

    while x < statics.getRoot().children.length
      rootDisplayNode.children.push addAndReturnChild(statics.getRoot(), x)
      x++
    displayDataset

  @setWidthAndHeight = ->
    
    #if( isRunFromTopWindow ) 
    w = thisWindow.innerWidth - 25
    h = thisWindow.innerHeight - 25

  
  #else
  
  #w =  thisWindow.innerWidth-25;
  #h = thisWindow.innerHeight;
  @getThisId = ->
    thisID

  
  # to be called on window call
  @unregister = ->
    console.log "Got unregister " + thisID
    statics.getGoObjects()[thisID] = null
    force.stop()  if force
    if vis
      vis.selectAll("text").remove()
      vis.selectAll("circle.node").remove()
      vis.selectAll("line.link").remove()
      vis.selectAll("line").remove()

  @reVis = (revisAll) ->
    if revisAll
      registered = statics.getGoObjects()
      for id of registered
        registered[id].reVisOne()  if registered[id]
    else
      @reVisOne()

  @reVisOne = (resetPositions) ->
    @setWidthAndHeight()
    @setInitialPositions()  unless graphType is "ForceTree"
    vis.selectAll("g").remove()  unless graphType is "ForceTree"
    vis.remove()
    @reforce()
    dirty = true
    @update()

  @setQuantitativeDynamicRanges = ->
    chosen = aDocument.getElementById("colorByWhat")
    aRange = statics.getRanges()[chosen.value]
    if isRunFromTopWindow
      unless aRange?
        aDocument.getElementById("lowQuantRange").value = "categorical"
        aDocument.getElementById("highQuantRange").value = "categorical"
        aDocument.getElementById("lowQuantRange").enabled = false
        aDocument.getElementById("highQuantRange").enabled = false
      else
        aDocument.getElementById("lowQuantRange").value = aRange[0]
        aDocument.getElementById("highQuantRange").value = aRange[1]
    @redrawScreen()  unless firstUpdate

  @addIndividualMenuDynamicMenuContent = ->
    allNames = []
    scatterX = thisDocument.getElementById("scatterX")
    scatterY = thisDocument.getElementById("scatterY")
    xString = "<option value=\"circleX\">circleX</option>"
    yString = "<option value=\"circleY\">circleY</option>"
    scatterX.innerHTML += xString
    scatterY.innerHTML += yString
    scatterX.innerHTML += yString
    scatterY.innerHTML += xString
    
    #todo: these will be in a different order than other menus
    for prop1 of statics.getRanges()
      allNames.push prop1
    for prop2 of statics.getOrdinalScales()
      allNames.push prop2
    x = 0

    while x < allNames.length
      propertyName = allNames[x]
      selectHTML = "<option value=\"" + propertyName + "\">" + propertyName + "</option>"
      scatterX.innerHTML += selectHTML
      scatterY.innerHTML += selectHTML
      x++

  @addDynamicMenuContent = ->
    return  unless isRunFromTopWindow
    mySidebar = aDocument.getElementById("sidebar")
    mySidebar.innerHTML += "<select id=\"sortByWhat\" onChange=myGo.resort()></select>"
    mySidebar.innerHTML += "<h3> Size: <h3>"
    selectHTML = "<select id=\"sizeByWhat\" onchange=myGo.reVis(false)>"
    selectHTML += "</select>"
    mySidebar.innerHTML += selectHTML
    mySidebar.innerHTML += "<br>Max size: <input type=\"number\"" + " id=\"maxSize\" min=\"0\" max=\"100\" value=\"30\" onkeypress=\"return myGo.isNumber(event)\" onchange=myGo.reVis(false)></input>" + "<br>Min size: <input type=\"number\"" + " id=\"minSize\" min=\"0\" max=\"100\"  value=\"2\" onkeypress=\"return myGo.isNumber(event)\" onchange=myGo.reVis(false)></input>" + "<br><input type=\"checkbox\"" + "id=\"logSize\" onchange=myGo.reVis(false)>log</input>" + "<input type=\"checkbox\"" + "id=\"invertSize\" onchange=myGo.reVis(false)>invert</input><br>"
    dataMenuHTML = "<li id=\"dataMenu\"><a>Data</a><ul>"
    for propertyName of nodes[0]
      if propertyName isnt "forceTreeNodeID" and propertyName isnt "x" and propertyName isnt "y" and propertyName isnt "children" and propertyName isnt "fixed"
        isNumeric = true
        selectHTML = "<option value=\"" + propertyName + "\">" + propertyName + "</option>"
        range = []
        range[0] = nodes[0][propertyName]
        range[1] = nodes[0][propertyName]
        if @isNumber(range[0]) and @isNumber(range[1])
          range[0] = 1.0 * range[0]
          range[1] = 1.0 * range[1]
        x = 0

        while isNumeric and x < nodes.length
          aVal = nodes[x][propertyName]
          unless @isNumber(aVal)
            isNumeric = false
          else
            aVal = 1.0 * aVal
            range[0] = aVal  if aVal < range[0]
            range[1] = aVal  if aVal > range[1]
          x++
        if isNumeric
          statics.getRanges()[propertyName] = range
        else
          statics.getOrdinalScales()[propertyName] = d3.scale.ordinal()
          statics.getColorScales()[propertyName] = d3.scale.category20b()
        aDocument.getElementById("sizeByWhat").innerHTML += selectHTML
        aDocument.getElementById("sortByWhat").innerHTML += selectHTML
        dataMenuHTML += "<li id=\"dataRange" + propertyName + "\"><a>" + propertyName + " </a></li>"  if propertyName isnt "xMap" and propertyName isnt "yMap" and propertyName isnt "xMapNoise" and propertyName isnt "yMapNoise"
        dataNames.push "dataRange" + propertyName
    dataMenuHTML += "</ul></li>"
    x = 0

    while x < dataNames.push
      innerString = ""
      y = 0

      while y < 5
        innerString += "<li>Number " + x + "</li>"
        y++
      innerString += ""
      aDocument.getElementById(dataNames).innerHTML += innerString
      x++
    aDocument.getElementById("nav").innerHTML += dataMenuHTML
    mySidebar.innerHTML += "<h3> Color: <h3>"
    selectHTML = "<select id=\"colorByWhat\" onchange=myGo.setQuantitativeDynamicRanges()>"
    selectHTML += "<option value=\"nodeDepth" + "\">" + "node depth" + "</option>"
    for propertyName of nodes[0]
      selectHTML += "<option value=\"" + propertyName + "\">" + propertyName + "</option>"  if propertyName isnt "forceTreeNodeID" and propertyName isnt "x" and propertyName isnt "y" and propertyName isnt "children" and propertyName isnt "fixed" and propertyName isnt "nodeDepth"
    selectHTML += "<option value=\"colorByMarked" + "\">" + "marked" + "</option>"
    selectHTML += "</select>"
    mySidebar.innerHTML += selectHTML
    mySidebar.innerHTML += "<br><input type=\"checkbox\"" + "id=\"logColor\" onchange=myGo.redrawScreen()>log</input>"
    mySidebar.innerHTML += "<input type=\"checkbox\" id=\"textIsBlack\"" + "onchange=myGo.redrawScreen()>text always black</input>"
    labelHTML = "<li><a>Labels</a><ul>"
    labelHTML += "<li><input type=\"checkbox\" id=\"cicleLabelScheme\"" + "onchange=myGo.redrawScreen() checked=true>" + "Smart circular labels</input><br><input type=\"checkbox\" id=\"labelOnlyTNodes\"" + "onchange=myGo.redrawScreen()> Label only T-Nodes</input></li>"
    for propertyName of nodes[0]
      if propertyName isnt "forceTreeNodeID" and propertyName isnt "x" and propertyName isnt "y"
        newHTML = "<li><input type=\"checkbox\" id=\"label" + propertyName + "\"" + "onchange=myGo.redrawScreen()>" + propertyName + "</input></li>"
        labelHTML += newHTML
        statics.getLabelCheckBoxes().push "label" + propertyName
    labelHTML += "<li>Font Adjust <input type=\"range\" id=\"fontAdjust\""
    labelHTML += "min=\"5\" max=\"25\" value=\"15\" onchange=myGo.redrawScreen()></input></li>"
    labelHTML += "</ul></li>"
    aDocument.getElementById("nav").innerHTML += labelHTML
    mySidebar.innerHTML += "<h3> Filter: <h3>"
    mySidebar.innerHTML += "node depth: <input type=\"number\" id=\"depthFilter\" onkeypress=\"return myGo.isNumber(event)\" " + " min=\"2\" " + "max=\" ranges[\"nodeDepth\"] value=2 onchange=myGo.setTopNodes()></input><br>"
    rangeHTML = "Depth Filter:<input type=\"range\" id=\"depthFilterRange\" min=\"0\" " + "max=\"" + topNodes.length + "\" value=\"0\" onchange=myGo.setTopNodes()><br></input>"
    mySidebar.innerHTML += rangeHTML
    @setTopNodes()
    aTable = ""
    aTable += "<table border=1 id=\"tNodeTable\">"
    aTable += "<tr>"
    aTable += "<td>Number of Visible Nodes</td>"
    aTable += "<td></td>"
    aTable += "</tr>"
    aTable += "<tr>"
    aTable += "<td>Number of TNodes</td>"
    aTable += "<td></td>"
    aTable += "</tr>"
    aTable += "</table>"
    mySidebar.innerHTML += aTable

  @setTopNodes = ->
    topNodes = []
    x = 0

    while x < nodes.length
      topNodes.push nodes[x]  if nodes[x].nodeDepth is aDocument.getElementById("depthFilter").value
      x++
    aDocument.getElementById("depthFilterRange").max = topNodes.length  if isRunFromTopWindow
    @showOnlyMarked true

  @showOnlyMarked = (withRedraw) ->
    aVal = aDocument.getElementById("depthFilterRange").value
    if aVal is 0
      x = 0

      while x < nodes.length
        nodes[x].doNotShow = false
        x++
    else
      markSelfAndDaughters = (aNode) ->
        aNode.doNotShow = false
        if aNode.children?
          y = 0

          while y < aNode.children.length
            markSelfAndDaughters aNode.children[y]
            y++
      x = 0

      while x < nodes.length
        nodes[x].doNotShow = true
        x++
      aVal = aVal - 1
      myNode = topNodes[aVal]
      markSelfAndDaughters myNode
    statics.getRoot().doNotShow = false
    if withRedraw
      dirty = true
      @redrawScreen()

  
  # calls redrawAScreen on all registered listeners
  @redrawScreen = ->
    registered = statics.getGoObjects()
    for id of registered
      registered[id].redrawAScreen()  if registered[id]

  @redrawAScreen = ->
    aDocument.getElementById("logSize").enabled = true
    aBox = aDocument.getElementById("logColor").enabled = true
    
    # right now these are getting stuck in the off position
    #  	// can't log an ordinal color scale...
    #  	if(  statics.getOrdinalScales()[ aDocument.getElementById("sizeByWhat").value] != null )  
    #  	{
    #  		aBox = aDocument.getElementById("logSize");
    #  		aBox.checked=false;
    #  		aBox.enabled=false;
    #  	}
    #  	else
    #  	{
    #  		aDocument.getElementById("logSize").enabled=true;
    #  	}
    #  	
    #  	// can't log an ordinal color scale...
    #  	if(  statics.getOrdinalScales()[ aDocument.getElementById("colorByWhat").value] != null )  
    #  	{
    #  		aBox = aDocument.getElementById("logColor");
    #  		aBox.checked=false;
    #  		aBox.enabled=false;
    #  	}
    #  	else
    #  	{
    #  		aBox = aDocument.getElementById("logColor").enabled=true;
    #  	}
    #  	
    dirty = true
    @update()

  @getLabelText = (d) ->
    return ""  if d.marked is false and aDocument.getElementById("labelOnlyTNodes").checked
    returnString = ""
    for propertyName of nodes[0]
      aCheckBox = aDocument.getElementById("label" + propertyName)
      returnString += d[propertyName] + " "  if aCheckBox? and aCheckBox.checked
    return ""  if circleDraws[d.nodeDepth] is returnString  if aDocument.getElementById("cicleLabelScheme").checked and graphType is "ForceTree" or ((thisDocument.getElementById("scatterX").value is "circleX" or thisDocument.getElementById("scatterX").value is "circleY") or (thisDocument.getElementById("scatterY").value is "circleX" or thisDocument.getElementById("scatterY").value is "circleY"))
    circleDraws[d.nodeDepth] = "" + returnString
    returnString

  @myFilterNodes = (d) ->
    return true  if d.parentDataNode.doNotShow is false
    false

  @myFilterLinks = (d) ->
    return false  if d.source.parentDataNode.doNotShow is true or d.target.parentDataNode.doNotShow is true
    true

  @gravityAdjust = ->
    myGo.setInitialPositions()  unless graphType is "ForceTree"
    myGo.redrawScreen()

  
  # from http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
  @isNumber = (n) ->
    not isNaN(parseFloat(n)) and isFinite(n)

  @getAVal = (d, xAxis) ->
    return (if xAxis then d.x else d.y)  if graphType is "ForceTree"
    d = d.parentDataNode
    chosen = null
    if xAxis
      chosen = thisDocument.getElementById("scatterX").value
    else
      chosen = thisDocument.getElementById("scatterY").value
    return d.xMap[thisID]  if chosen is "circleX"
    return d.yMap[thisID]  if chosen is "circleY"
    
    # quantitative scale 
    if statics.getRanges()[chosen]?
      aRange = statics.getRanges()[chosen]
      aScale = d3.scale.linear().domain(aRange).range([0, (if xAxis then w else h)])
      aScale d[chosen]
    else
      statics.getOrdinalScales()[chosen].range [0, (if xAxis then w else h)]
      statics.getOrdinalScales()[chosen] d[chosen]

  @addAxis = (chosen, isXAxis) ->
    return  if chosen is "circleX" or chosen is "circleY"
    if statics.getRanges()[chosen]?
      if isXAxis
        aRange = statics.getRanges()[chosen]
        aScale = d3.scale.linear().domain(aRange).range([0, w])
        xAxis = d3.svg.axis().scale(aScale).orient("bottom")
        vis.append("svg:svg").call xAxis
      else
        aRange = statics.getRanges()[chosen]
        aScale = d3.scale.linear().domain(aRange).range([0, h])
        yAxis = d3.svg.axis().scale(aScale).orient("right")
        vis.append("svg:svg").call yAxis

  @getRadiusVal = (d) ->
    propToSize = aDocument.getElementById("sizeByWhat").value
    returnVal = aDocument.getElementById("maxSize").value
    minValue = aDocument.getElementById("minSize").value * 1.0
    maxValue = aDocument.getElementById("maxSize").value * 1.0
    aRange = maxValue - minValue
    
    # quantitative values
    if statics.getRanges()[propToSize]?
      if aDocument.getElementById("logSize").checked
        if d[propToSize] > 0 # a p-value of zero yields a maximum sized radius
          maxScale = Math.log(statics.getRanges()[propToSize][1]) / Math.LN10
          aValue = Math.log(d[propToSize]) / Math.LN10
          partial = aValue / maxScale
          partial = partial * aRange
          returnVal = minValue + partial
      else
        aValue = 1.0 * d[propToSize]
        partial = (aValue - statics.getRanges()[propToSize][0]) / (statics.getRanges()[propToSize][1] - statics.getRanges()[propToSize][0])
        partial = partial * aRange
        returnVal = minValue + partial
    #ordinal values 
    else
      statics.getOrdinalScales()[propToSize].range minValue, maxValue
      returnVal = statics.getOrdinalScales()[propToSize](d[propToSize])
    returnVal = maxValue - returnVal  if aDocument.getElementById("invertSize").checked
    returnVal = minValue  if returnVal < minValue
    returnVal = maxValue  if returnVal > maxValue
    returnVal

  updateNum = 0
  @toggleVisibilityOfSidebars = ->
    registered = statics.getGoObjects()
    for id of registered
      if registered[id]
        registered[id].getThisDocument().getElementById("sidebar").style.backgroundColor = "#ffffff"
        aDoc = registered[id].getThisDocument()
        if aDoc
          if aDocument.getElementById("showLeftControl").checked
            aDoc.getElementById("sidebar").style.visibility = "visible"
          else
            aDoc.getElementById("sidebar").style.visibility = "hidden"
        else
          console.log "Could not get doc for " + id
    if aDocument.getElementById("showRightDataPanel").checked
      aDocument.getElementById("rightInfoArea").style.visibility = "visible"
    else
      aDocument.getElementById("rightInfoArea").style.visibility = "hidden"
    aDocument.getElementById("rightInfoArea").style.backgroundColor = "#ffffff"

  @handleKeyboardEvent = (e) ->
    
    # modded from http://stackoverflow.com/questions/4368036/how-to-listener-the-keyboard-type-text-in-javascript
    e = e or thisWindow.event
    charCode = (if (typeof e.which is "number") then e.which else e.keyCode)
    if charCode
      if String.fromCharCode(charCode) is "A" or String.fromCharCode(charCode) is "a"
        thisContext.arrangeForcePlot true
      else if String.fromCharCode(charCode) is "T" or String.fromCharCode(charCode) is "t"
        thisContext.arrangeForcePlot false
      else if String.fromCharCode(charCode) is "L" or String.fromCharCode(charCode) is "l"
        if thisContext.getParentDocument().getElementById("showLeftControl").checked
          thisContext.getParentDocument().getElementById("showLeftControl").checked = false
        else
          thisContext.getParentDocument().getElementById("showLeftControl").checked = true
        thisContext.toggleVisibilityOfSidebars()
      else if String.fromCharCode(charCode) is "R" or String.fromCharCode(charCode) is "r"
        if thisContext.getParentDocument().getElementById("showRightDataPanel").checked
          thisContext.getParentDocument().getElementById("showRightDataPanel").checked = false
        else
          thisContext.getParentDocument().getElementById("showRightDataPanel").checked = true
        thisContext.toggleVisibilityOfSidebars()
      else if String.fromCharCode(charCode) is "V" or String.fromCharCode(charCode) is "v"
        thisContext.hideAndShow()
        thisContext.redrawScreen()
      else if String.fromCharCode(charCode) is "Q" or String.fromCharCode(charCode) is "q"
        aVal = parseFloat(aDocument.getElementById("localGravity").value)
        aVal = aVal + 0.5
        aDocument.getElementById("localGravity").value = aVal
      else if String.fromCharCode(charCode) is "W" or String.fromCharCode(charCode) is "w"
        aVal = parseFloat(aDocument.getElementById("localGravity").value)
        aVal = aVal - 0.5
        aDocument.getElementById("localGravity").value = aVal

  
  # from http://stackoverflow.com/questions/7295843/allow-only-numbers-to-be-typed-in-a-textbox
  @isNumber = (evt) ->
    evt = (if (evt) then evt else window.event)
    charCode = (if (evt.which) then evt.which else evt.keyCode)
    #decimal places are allowed
    return true  if charCode is 46
    return false  if charCode > 31 and (charCode < 48 or charCode > 57)
    true

  @update = ->
    return  unless initHasRun
    if dirty
      
      # Restart the force layout.
      
      # Enter any new nodes.
      updateNodesLinksText = ->
        
        #console.log("tick " + dragging);
        if not animationOn and (stopOnChild is true or dragging is true)
          dataset = thisContext.getDisplayDataset()
          x = 0

          while x < dataset.nodes.length
            unless dataset.nodes[x].userMoved
              dataset.nodes[x].x = dataset.nodes[x].parentDataNode.xMap[thisID]
              dataset.nodes[x].y = dataset.nodes[x].parentDataNode.yMap[thisID]
            dataset.nodes[x].fixed = true  if animationOn is false
            x++
          force.stop()  if force and animationOn is false and dragging is false
          stopOnChild = false  if stopOnChild is true
        node.attr("cx", (d) ->
          thisContext.getAVal d, true
        ).attr "cy", (d) ->
          thisContext.getAVal d, false

        if anyLabels
          if graphType is "ForceTree"
            text.attr "transform", (d) ->
              "translate(" + d.x + "," + d.y + ")"

          else
            
            # radial labels: todo: this should be an option
            #	      		console.log("set rotate " + Math.PI *
            #	      				d.listPosition / statics.getNodes().length);
            #	      		text.attr("transform", function(d) { return "rotate(" + Math.PI *
            #	      				d.listPosition / statics.getNodes().length
            #	      					+ ")"});
            #	      					
            text.attr "transform", (d) ->
              "translate(" + d.xMap[thisID] + "," + d.yMap[thisID] + ")"

        if graphType is "ForceTree" and not aDocument.getElementById("hideLinks").checked
          link.attr("x1", (d) ->
            d.source.x
          ).attr("y1", (d) ->
            d.source.y
          ).attr("x2", (d) ->
            d.target.x
          ).attr "y2", (d) ->
            d.target.y

      if animationOn is false and stopOnChild is false
        dataset = thisContext.getDisplayDataset()
        x = 0

        while x < dataset.nodes.length
          unless dataset.nodes[x].userMoved
            dataset.nodes[x].x = dataset.nodes[x].parentDataNode.xMap[thisID]
            dataset.nodes[x].y = dataset.nodes[x].parentDataNode.yMap[thisID]
          x++
      dirty = false
      anyLabels = false
      x = 0

      while x <= statics.getMaxLevel()
        circleDraws[x] = ""
        x++
      x = 0

      while not anyLabels and x < statics.getLabelCheckBoxes().length
        aCheckBox = aDocument.getElementById(statics.getLabelCheckBoxes()[x])
        anyLabels = aCheckBox.checked  if aCheckBox?
        x++
      noiseValue = aDocument.getElementById("noiseSlider").value
      numMarked = 0
      numVisible = 0
      i = 0

      while i < nodes.length
        nodes[i].marked = false
        if not nodes[i].doNotShow and nodes[i].setVisible is true
          nodes[i].marked = true
          numVisible++
          if nodes[i].children?
            j = 0

            while nodes[i].marked and j < nodes[i].children.length
              nodes[i].marked = false  unless nodes[i].children[j].doNotShow
              j++
          numMarked = numMarked + 1  if nodes[i].marked is true
        if addNoise
          if firstNoise
            nodes[i].xMapNoise = nodes[i].xMap[thisID]
            nodes[i].yMapNoise = nodes[i].yMap[thisID]
          else
            nodes[i].xMap[thisID] = nodes[i].xMapNoise
            nodes[i].yMap[thisID] = nodes[i].yMapNoise
          noiseX = 0.1 * nodes[i].xMap[thisID] * Math.random() * (noiseValue / 100)
          noiseY = 0.1 * nodes[i].yMap[thisID] * Math.random() * (noiseValue / 100)
          noiseX = -noiseX  if Math.random() < 0.5
          noiseY = -noiseY  if Math.random() < 0.5
          nodes[i].xMap[thisID] += noiseX
          nodes[i].yMap[thisID] += noiseY
        i++
      firstNoise = false  if addNoise
      i = 0

      while i < nodes.length
        nodes[i].thisNodeColor = @color(nodes[i])
        nodes[i].thisNodeRadius = @getRadiusVal(nodes[i])
        i++
      filteredNodes = thisContext.getDisplayDataset().nodes.filter(thisContext.myFilterNodes)
      vis.selectAll("text").remove()
      if graphType is "ForceTree"
        force.nodes filteredNodes
        unless aDocument.getElementById("hideLinks").checked
          links = d3.layout.tree().links(filteredNodes)
          force.links links
        else
          links = d3.layout.tree().links([])
          force.links links
        force.start().gravity aDocument.getElementById("gravitySlider").value / 100  if stopOnChild is true or animationOn is true
      node = vis.selectAll("circle.node").data(filteredNodes, (d) ->
        d.name
      ).style("fill", (d) ->
        d.parentDataNode.thisNodeColor
      ).style("opacity", aDocument.getElementById("opacitySlider").value / 100)
      node.enter().append("svg:circle").on("click", @myClick).attr("class", "node").attr("r", (d) ->
        d.parentDataNode.thisNodeRadius
      ).style("fill", (d) ->
        d.parentDataNode.thisNodeColor
      ).style("opacity", aDocument.getElementById("opacitySlider").value / 100).on("mouseenter", @myMouseEnter).on "mouseleave", @myMouseLeave
      node.attr("cx", (d) ->
        thisContext.getAVal d, true
      ).attr "cy", (d) ->
        thisContext.getAVal d, false

      node.call force.drag  if graphType is "ForceTree"
      if graphType isnt "ForceTree" and not aDocument.getElementById("hideLinks").checked and ((thisDocument.getElementById("scatterX").value is "circleX" or thisDocument.getElementById("scatterX").value is "circleY") and (thisDocument.getElementById("scatterY").value is "circleX" or thisDocument.getElementById("scatterY").value is "circleY"))
        addNodeAndChildren = (aNode) ->
          depth++
          if not aNode.doNotShow and aNode.children and aNode.children.length > 0
            i = 0

            while i < aNode.children.length
              childNode = aNode.children[i]
              unless childNode.doNotShow
                vis.append("line").attr("x1", aNode.xMap[thisID]).attr("y1", aNode.yMap[thisID]).attr("x2", childNode.xMap[thisID]).attr("y2", childNode.yMap[thisID]).attr("stroke-width", 0.5).attr "stroke", "black"
                addNodeAndChildren childNode
              i++
          depth--
        depth = 0
        addNodeAndChildren statics.getRoot()
      else vis.selectAll("line").remove()  unless graphType is "ForceTree"
      force.on "tick", updateNodesLinksText  if graphType is "ForceTree"
      
      #force.on("end", updateNodesLinksText);
      
      # Update the links	      	
      if graphType is "ForceTree" and not aDocument.getElementById("hideLinks").checked
        link = vis.selectAll("line.link").data(links.filter(@myFilterLinks), (d) ->
          d.target.name
        )
      
      #);
      
      # Enter any new links.
      #vis.remove("svg:line");
      link.enter().insert("svg:line", ".node").attr "class", "link"  if graphType is "ForceTree" and not aDocument.getElementById("hideLinks").checked
      table = aDocument.getElementById("tNodeTable") #.rows[0].cells[1].item[0] = "" + numMarked ;
      table.rows[0].cells[1].innerHTML = "" + numVisible
      row = table.rows[1]
      cell = row.cells[1]
      cell.innerHTML = "" + numMarked
      x = 0

      while x < nodes.length
        nodes[x].nodeLabelText = @getLabelText(nodes[x])
        x++
      if anyLabels
        text = vis.selectAll("text").data(filteredNodes).enter().append("svg:text").text((d) ->
          d.parentDataNode.nodeLabelText
        ).attr("font-family", "sans-serif").attr("font-size", aDocument.getElementById("fontAdjust").value + "px").attr("fill", (d) ->
          thisContext.getTextColor d.parentDataNode
        )
        unless graphType is "ForceTree"
          text.attr("x", (d) ->
            thisContext.getAVal d, true
          ).attr "y", (d) ->
            thisContext.getAVal d, false

        
        # todo: radial labels should be an option
        #  						.attr("transform", 
        #  	         				 	function(d) 
        #  	         				 	{ 
        #  									var anAngle = 360.0 *  
        #       			 					d.listPosition / (Math.PI *statics.getNodes().length);
        #  									
        #  									console.log( anAngle);
        #  									
        #  	         			 			return "rotate(" + anAngle + "," 
        #  	         			 					+ thisContext.getAVal( d,true)
        #  												+ "," + thisContext.getAVal( d,false) + ")"
        #  	         			         }
        #  	         		         );
        #  	         		         
        else
          text.attr("dx", (d) ->
            15
          ).attr "dy", (d) ->
            ".35em"

      unless graphType is "ForceTree"
        @addAxis thisDocument.getElementById("scatterX").value, true
        @addAxis thisDocument.getElementById("scatterY").value, false
      
      # cleanup
      link.exit().remove()  if graphType is "ForceTree" and not aDocument.getElementById("hideLinks").checked
      node.exit().remove()
    
    # the color choosers don't work unless they are initialized first
    # hence they are initialized in the "section" and then moved to the appropriate menu
    # once everything else has settled in...
    @setQuantitativeDynamicRanges()  if firstUpdate and isRunFromTopWindow
    
    #aDocument.getElementById("ColorSubMenu").appendChild(aDocument.getElementById("color1"));
    #aDocument.getElementById("color1").style.visibility="visible";
    
    #aDocument.getElementById("ColorSubMenu").appendChild(aDocument.getElementById("color2"));
    #aDocument.getElementById("color2").style.visibility="visible";
    firstUpdate = false

  @releaseAllFixed = ->
    displayNodes = @getDisplayDataset().nodes
    x = 0

    while x < displayNodes.length
      unless displayNodes[x].userMoved
        displayNodes[x].fixed = false
        displayNodes[x].x = displayNodes[x].parentDataNode.xMap[thisID]
        displayNodes[x].y = displayNodes[x].parentDataNode.yMap[thisID]
      x++
    stopOnChild = true
    animationOn = true
    force.start()  if force
    @redrawScreen()

  @getTextColor = (d) ->
    return "#000000"  if aDocument.getElementById("textIsBlack").checked
    chosen = aDocument.getElementById("colorByWhat").value
    @color d  if statics.getColorScales()[chosen]? or statics.getRanges()[chosen]?

  @myMouseEnter = (d) ->
    force.stop()  if force and animationOn is false and dragging is false
    return  unless aDocument.getElementById("mouseOverHighlights").checked
    statics.getHighlightedNode().highlight = false  if statics.getHighlightedNode()
    d = d.parentDataNode
    statics.setHighlightedNode d
    d.highlight = true
    lastSelected = d
    infoPane = aDocument.getElementById("rightInfoArea")
    someHTML = "<table>"
    for prop of d
      if prop isnt "forceTreeNodeID" and prop isnt "x" and prop isnt "y" and prop isnt "children" and prop isnt "fixed" and prop isnt "xMap" and prop isnt "yMap" and prop isnt "xMapNoise" and prop isnt "yMapNoise" and prop isnt "highlight" and prop isnt "nodeLabelText" and prop isnt "thisNodeRadius" and prop isnt "thisNodeColor" and prop isnt "marked" and prop isnt "doNotShow" and prop isnt "listPosition" and prop isnt "px" and prop isnt "py" and prop isnt "weight" and prop isnt "aParentNode"
        aVal = "" + d[prop]
        
        #todo: This will truncate long strings..
        someHTML += ("<tr><td>" + prop + "</td><td> " + aVal.substring(0, 25) + "</td></tr>")
    someHTML += "</table>"
    infoPane.innerHTML = someHTML
    dirty = true
    thisContext.redrawScreen()

  @myMouseLeave = ->
    force.stop()  if force and animationOn is false and dragging is false
    return  unless aDocument.getElementById("mouseOverHighlights").checked
    statics.getHighlightedNode().highlight = false  if statics.getHighlightedNode()
    dirty = true
    thisContext.redrawScreen()

  @setInitialPositions = ->
    @arrangeForcePlot false  if animationOn is false

  @arrangeForcePlot = (arrangeChildren) ->
    topNode = statics.getRoot()
    topNode = lastSelected  if arrangeChildren and lastSelected
    displayNodes = @getDisplayDataset().nodes
    x = 0

    while x < displayNodes.length
      displayNodes[x].fixed = false
      displayNodes[x].userMoved = false  if arrangeChildren is false
      if arrangeChildren and topNode is displayNodes[x].parentDataNode
        displayNodes[x].fixed = true
        displayNodes[x].userMoved = true
      x++
    numVisibleArray = []
    numAssignedArray = []
    x = 0

    while x <= statics.getMaxLevel()
      numVisibleArray.push 0
      numAssignedArray.push 0
      x++
    localMaxLevel = statics.getMaxLevel()
    localMaxLevel = 0  unless topNode is statics.getRoot()
    nodesToRun = nodes
    if arrangeChildren and lastSelected
      addNodeAndChildren = (aNode) ->
        nodesToRun.push aNode
        localMaxLevel = Math.max(aNode.nodeDepth, localMaxLevel)
        if aNode.children
          x = 0

          while x < aNode.children.length
            addNodeAndChildren aNode.children[x]
            x++
      nodesToRun = []
      addNodeAndChildren lastSelected
    x = 0

    while x < nodesToRun.length
      numVisibleArray[nodesToRun[x].nodeDepth] = numVisibleArray[nodesToRun[x].nodeDepth] + 1  if nodesToRun[x].doNotShow is false
      x++
    
    # if we are not arranging to a child node
    # the root is at the top of the tree in the center of the screen
    if topNode is statics.getRoot()
      topNode.xMap[thisID] = w / 2.0 + 20.0
      topNode.yMap[thisID] = h / 2.0
    radius = parseFloat(Math.min(w, h)) / 2.0
    radius = radius - radius * parseFloat(aDocument.getElementById("gravitySlider").value) / 100.0
    localMinLevel = 0.0
    if arrangeChildren and lastSelected
      radius = radius / aDocument.getElementById("localGravity").value
      localMinLevel = topNode.nodeDepth
    localMinLevel = parseFloat(localMinLevel)
    piTwice = 2.0 * Math.PI
    range = parseFloat(statics.getMaxLevel() - localMinLevel)
    x = 0

    while x < nodesToRun.length
      if nodesToRun[x].doNotShow is false
        aPosition = parseFloat(numAssignedArray[nodesToRun[x].nodeDepth]) / numVisibleArray[nodesToRun[x].nodeDepth]
        aRad = (parseFloat(nodesToRun[x].nodeDepth) - localMinLevel) / range * radius
        nodesToRun[x].xMap[thisID] = topNode.xMap[thisID] - aRad * Math.cos(piTwice * aPosition)
        nodesToRun[x].yMap[thisID] = aRad * Math.sin(piTwice * aPosition) + topNode.yMap[thisID]
        numAssignedArray[nodesToRun[x].nodeDepth] = numAssignedArray[nodesToRun[x].nodeDepth] + 1
      x++
    animationOn = false
    stopOnChild = true

  @initialize = ->
    @flatten()
    @addIndividualMenuDynamicMenuContent()  unless graphType is "ForceTree"
    initHasRun = true
    dirty = true
    @update()
    @toggleVisibilityOfSidebars()
    @arrangeForcePlot false  if graphType is "ForceTree"
    @redrawScreen()

  @getQuantiativeColor = (d) ->
    chosen = aDocument.getElementById("colorByWhat").value
    lowColor = "#" + aDocument.getElementById("quantColorLow").value
    highColor = "#" + aDocument.getElementById("quantColorHigh").value
    aRange = []
    aRange.push aDocument.getElementById("lowQuantRange").value
    aRange.push aDocument.getElementById("highQuantRange").value
    if lowColor > highColor
      temp = lowColor
      lowColor = highColor
      highColor = temp
    if aDocument.getElementById("logColor").checked
      aVal = d[chosen]
      maxScale = Math.log(aRange[1]) / Math.LN10
      if aVal is 0
        aVal = maxScale
      else
        aVal = Math.log(aVal) / Math.LN10
      aScale = d3.scale.linear().domain([0, maxScale]).range([lowColor, highColor]).clamp(true)
      aScale aVal
    else
      aScale = d3.scale.linear().domain(aRange).range([lowColor, highColor]).clamp(true)
      aScale d[chosen]

  @color = (d) ->
    return "#fd8d3c"  if d.highlight is true # orange
    chosen = aDocument.getElementById("colorByWhat").value
    return @getQuantiativeColor(d)  if statics.getRanges()[chosen]?
    return statics.getColorScales()[chosen](d[chosen])  if statics.getColorScales()[chosen]?
    return "#3182bd"  if d._children? # bright blue
    return "#000000"  if d.marked # black
    (if d._children then "#3182bd" else (if d.children then "#c6dbef" else "#fd8d3c"))

  
  # Toggle children on click.
  @myClick = (d) ->
    aValue = aDocument.getElementById("clickDoesWhat").value
    if aValue is "deletes"
      initHasRun = false
      d.children = null
      d._children = null
      thisContext.initialize()
    if aValue is "collapses"
      initHasRun = false
      unless d._children?
        d._children = d.children
        d.children = null
      else
        d.children = d._children
        d._children = null
      thisContext.initialize()
    else thisContext.hideAndShow d  if aValue is "hides"
    dirty = true
    thisContext.update()

  @hideAndShow = (d) ->
    d = statics.getHighlightedNode()  unless d
    d = statics.getRoot()  unless d
    statics.setHighlightReverse not statics.getHighlightReverse()
    if statics.getHighlightReverse() is false
      @showOnlyMarked false
    else
      x = 0

      while x < nodes.length
        nodes[x].doNotShow = true
        x++
      thisContext.highlightAllChildren d
      thisContext.highlightAllParents d

  @highlightAllChildren = (d) ->
    return  unless d?
    d.doNotShow = false
    return  if not d.children or not d.children?
    x = 0

    while x < d.children.length
      @highlightAllChildren d.children[x]
      x++

  @highlightAllParents = (d) ->
    return  unless d?
    d.doNotShow = false
    thisContext.highlightAllParents d.aParentNode  if not d.aParentNode or d.aParentNode?

  
  # Returns a list of all nodes under the root.
  @flatten = ->
    addNodeAndChildren = (aNode) ->
      level++
      statics.setMaxLevel Math.max(level, statics.getMaxLevel())
      if aNode?
        aNode.nodeDepth = level
        myNodes.push aNode
        if aNode.children?
          x = 0

          while x < aNode.children.length
            addNodeAndChildren aNode.children[x]
            aNode.children[x].aParentNode = aNode
            x++
      level--
    unless isRunFromTopWindow
      nodes = statics.getNodes()
      @setInitialPositions()
      @addDynamicMenuContent()
      return
    myNodes = []
    level = 0.0
    addNodeAndChildren statics.getRoot()
    i = 0

    while i < myNodes.length
      myNodes[i].forceTreeNodeID = i + 1  unless myNodes[i].forceTreeNodeID
      myNodes[i].listPosition = i
      myNodes[i].xMap = {}
      myNodes[i].yMap = {}
      myNodes[i].xMapNoise = {}
      myNodes[i].yMapNoise = {}
      i++
    nodes = myNodes
    statics.setNodes nodes
    @setInitialPositions()
    @addDynamicMenuContent()

  @reforce()
  if isRunFromTopWindow
    
    #aDocument.getElementById("color1").style.visibility="hidden";
    #aDocument.getElementById("color2").style.visibility="hidden";
    #todo: nice error message if file can't be found
    d3.json getQueryStrings(thisWindow)["FileToOpen"], (json) ->
      statics.setRoot json
      thisContext.initialize() # wait until the data is loaded to initialize

  else
    thisContext.initialize() # data is already loaded - ok to initialize.