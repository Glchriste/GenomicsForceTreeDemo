 //Function StaticHolder
 function StaticHolder() {
     //If "StaticHolder.ranges" is not defined
     //Create StaticHolder.ranges and other StaticHolder stuff
     if (!StaticHolder.ranges) {
         StaticHolder.ranges = {};
         StaticHolder.ordinalScales = {};
         StaticHolder.colorScales = {};
         StaticHolder.labelCheckBoxes = [];
         StaticHolder.counter = 0;
         StaticHolder.goObjects = {};
         StaticHolder.nodes = null;
         StaticHolder.root = null;
         StaticHolder.highlightedNode = null;
         StaticHolder.maxLevel = -1;
         StaticHolder.highlightReverse = false;
     }

     //Function to set the max level of StaticHolder
     this.setMaxLevel = function(aLevel) {
         StaticHolder.maxLevel = aLevel;
     }

     //Function to get "highlightReverse" of StaticHolder
     this.getHighlightReverse = function() {
         return StaticHolder.highlightReverse;
     }

     //Function to set highlightReverse to the function b
     this.setHighlightReverse = function(b) {
         StaticHolder.highlightReverse = b;
     }

     //Function to get the max level
     this.getMaxLevel = function() {
         return StaticHolder.maxLevel;
     }

     //Function to get the nodes of StaticHolder
     this.getNodes = function() {
         return StaticHolder.nodes;
     }

     //Function to get the highlightedNode of StaticHolder
     this.getHighlightedNode = function() {
         return StaticHolder.highlightedNode; // (highlightedNode is the node currently highlighted)
     }

     //Function to set the highlightedNode of StaticHolder
     this.setHighlightedNode = function(aNode) {
         StaticHolder.highlightedNode = aNode; // (highlightedNode is the node currently highlighted)
     }

     //Function to get the root of StaticHolder
     this.getRoot = function() {
         return StaticHolder.root;
     }

     //Function to set the root of StaticHolder
     this.setRoot = function(aRoot) {
         StaticHolder.root = aRoot;
     }

     //Function to set the nodes of StaticHolder
     this.setNodes = function(someNodes) {
         StaticHolder.nodes = someNodes;
     }

     //Function to get the ranges of StaticHolder
     this.getRanges = function() {
         return StaticHolder.ranges;
     }

     //Function to get ordinalScales of StaticHolder
     this.getOrdinalScales = function() {
         return StaticHolder.ordinalScales;
     }

     //Function to get colorScales of StaticHolder
     this.getColorScales = function() {
         return StaticHolder.colorScales;
     }

     //Function to get labelCheckBoxes of StaticHolder
     this.getLabelCheckBoxes = function() {
         return StaticHolder.labelCheckBoxes; //labelCheckBoxes are the check boxes for the labels on the left menu?
     }

     //Function to add a goObject to StaticHolder
     this.addGoObject = function(goObject) {
         StaticHolder.counter++; //Increase the counter for goObjects

         StaticHolder.goObjects[StaticHolder.counter] = goObject; //add a goObject to the array of goObjects stored

         return StaticHolder.counter; //return the current count of goObjects
     }

     //Function to get the array of current goObjects from StaticHolder
     this.getGoObjects = function() {
         return StaticHolder.goObjects;
     }
 }


 // modded from http://dotnetprof.blogspot.com/2012/11/get-querystring-values-using-javascript.html
 //Function to getQueryStrings.
 //This function returns a dictionary called queryStringColl of keys and values from the requestUrl
 function getQueryStrings(aWindow) {
     //Holds key:value pairs
     var queryStringColl = null;

     //Get querystring from url
     //(In other words, gets the string to search from aWindoer.location.search,
     //.toString() turns "aWindow.location.search"'s value into a string)
     var requestUrl = aWindow.location.search.toString();

     //If the requestURL is not blank / actually has a website link...
     if (requestUrl != '') {
         //Get the characters of requestUrl starting at index 1 (ignoring the first letter/character of requestUrl)
         //Basically, this line tells requestUrl to remove its first character.
         //Todo: insert reason why in comment
         requestUrl = requestUrl.substring(1);

         //Initialize queryStringColl as a blank dictionary
         queryStringColl = {};

         //Get key:value pairs from querystring
         //In other words, return a list of values between '&' characters in the string requestUrl
         var kvPairs = requestUrl.split('&');

         //loop through the elements of kvPairs...
         for (var i = 0; i < kvPairs.length; i++) {
             //set kvPair to equal a list of values between '=' characters
             //So, 'something=somethingelse' will look like [something, somethingelse]
             var kvPair = kvPairs[i].split('=');
             //put elements into the dictionary.
             //kvPair[0] is the key, kvPair[1] is the value associated with that key
             queryStringColl[kvPair[0]] = kvPair[1];
         }
     }
     //Return the dictionary
     return queryStringColl;
 }

 //This function makes everything run?
 function GO(parentWindow, thisWindow, isRunFromTopWindow) {
     //Variables
     var aDocument = parentWindow.document; //parentWindow's document
     var thisDocument = thisWindow.document; //thisWindow's document
     var statics = parentWindow.statics; //statics from parentWindow
     var thisID = statics.addGoObject(this); //thisId adds "this", the current object/function, as a goObject to statics
     var graphType = "ForceTree" //Sets graphType to be "ForceTree"
     var queryStrings = getQueryStrings(thisWindow) //gets the dictionary of queryStrings from thisWindow
     var addNoise = false; //addNoise = false Todo: what's this for?
     var firstNoise = true; //firstNoise = true. Todo: what's this for?
     var dataNames = []; //Declares an array of data names
     var lastSelected = null; //sets lastSelected to be null
     var animationOn = false; //sets animaionOn to false

     var stopOnChild = false; //sets stopOnChild to false todo: What's this for?
     var displayDataset = null; //sets displayDataset to null
     var dragging = false; //set dragging to false/off

     //sets addNoise to true and redraws the screen
     this.addNoise = function() {
         addNoise = true;
         this.redrawScreen();
     }

     //returns the current document (thisWindow.document)
     this.getThisDocument = function() {
         return thisDocument;
     }

     //returns the parent document (parentWindow.document)
     this.getParentDocument = function() {
         return aDocument;
     }

     //If the queryStrings dictionary isn't blank/null...
     if (queryStrings) {
         //get the graph type from queryStrings and set it to our variable graphType
         var aGraphType = queryStrings["GraphType"];
         if (aGraphType != null)
             graphType = aGraphType;
     }

     //set this.resort to be a function that sorts the nodes based on what the user selected in the checkbox(es)
     this.resort = function() {
         //get the value to sort by
         var compareChoice = aDocument.getElementById("sortByWhat").value;
         //sort by numerical values
         quantitativeSort = function(a, b) {
             if (1.0 * a[compareChoice] < 1.0 * b[compareChoice])
                 return -1;
             if (1.0 * a[compareChoice] > 1.0 * b[compareChoice])
                 return 1;
             return 0;
         }
         //sort by non-numerical values
         nonQuantitativeSort = function(a, b) {
             if (a[compareChoice] < b[compareChoice])
                 return -1;
             if (a[compareChoice] > b[compareChoice])
                 return 1;
             return 0;
         }
         //sorts using this code if "treeAwareSort" is not selected...
         if (!aDocument.getElementById("treeAwareSort").checked) {
             // quantiative
             //If compareChoice of getRanges() of statics is not null...
             if (statics.getRanges()[compareChoice] != null) {
                 nodes.sort(quantitativeSort); //Sort the nodes with quantitativeSort
             } else {
                 nodes.sort(nonQuantitativeSort); //If getRanges() of statics is null, sort with nonQuantitative sort
             }
         }
         //if "treeAwareSort" is selected, sort using this code...
         else {
             var newNodes = [];
             //adds a node to newNodes and then sorts the node's children
             addNodeAndSortDaughters = function(aNode) {
                 newNodes.push(aNode);
                 //return if the node doesn't have children
                 if (!aNode.children || aNode.children.length == 0)
                     return;
                 //otherwise, get the children...
                 var childrenNodes = [];
                 for (var x = 0; x < aNode.children.length; x++)
                     childrenNodes.push(aNode.children[x]);
                 //and sort the children...
                 //using quantatative sort if compareChoice of getRanges() of statics has a value
                 if (statics.getRanges()[compareChoice] != null) {
                     childrenNodes.sort(quantitativeSort);
                 }
                 //if getRanges() is null, use nonQuantitative sort on the children
                 else {
                     childrenNodes.sort(nonQuantitativeSort);
                 }
                 //give the array of childNodes to addNodeandSortDaughters...
                 //It sorts each child node and their children recursively
                 for (var x = 0; x < childrenNodes.length; x++)
                     addNodeAndSortDaughters(childrenNodes[x]);
             }

             //start sorting the nodes from the root
             addNodeAndSortDaughters(statics.getRoot());
             nodes = newNodes;
             //update static's list of nodes to be the new, sorted nodes
             statics.setNodes(newNodes);
         }
         //for every node, set its listPosition to be the index it is in the array
         for (var x = 0; x < nodes.length; x++)
             nodes[x].listPosition = x;
         //set the initial positions Todo: Insert what this does in the comment
         this.setInitialPositions();
         //redraw the screen with the sorted nodes
         this.redrawScreen();
     }

     // modded from http://mbostock.github.com/d3/talk/20111116/force-collapsible.html

     //Settings up the drawing area?
     var w, h,
         links,
         link,
         thisContext = this;

     var firstUpdate = true; //firstUpdate is set to true
     var initHasRun = false; //init has not run yet

     //Initialize the array of top nodes
     topNodes = [];

     //Todo: What is 'dirty' for?
     var dirty = true;

     //Initialize a dictionary called "circleDraws"
     //Todo: what is this for?
     var circleDraws = {};

     //Variables for force, mouse dragging, and the visualization
     var force, drag, vis;

     //Function that sets "this.dirty" to be true
     this.makeDirty = function() {
         this.dirty = true;
     }

     //computes the force layout
     this.reforce = function() {
         //set the width and height of the window
         this.setWidthAndHeight();
         //if the graphType is a "ForceTree"
         if (graphType == "ForceTree") {
             //set force to be equal to a d3 force layout...
             force = d3.layout.force()
                 .charge(function(d) { //set the charge of the graph's force layout
                     return d._children ? -d.numSeqs / 100 : -30;
                 })
                 .linkDistance(function(d) { //set the link distance of the graph's force layout
                     return d.target._children ? 80 * (d.nodeDepth - 16) / 16 : 30;
                 }) //set the size and gravity of the graph's force layout
             .size([w, h - 60]).gravity(aDocument.getElementById("gravitySlider").value / 100) //gravity value is set by
             //the current value on the gravity slider

             //set up the force layout's "drag" function
             //turns the ability to drag objects on
             //when a drag event starts, start the force layout
             drag = force.drag().on("dragstart", function(d) {
                 d.fixed = true;
                 d.userMoved = true;
                 dragging = true;
                 force.start();

             });

             //when dragging... start the force layout
             drag = force.drag().on("drag", function(d) {
                 dragging = true;
                 force.start();
             });

             //when the mouse drag event ends inside the force layout...
             drag = force.drag().on("dragend", function(d) {
                 d.fixed = true;
                 d.userMoved = true;
                 d.parentDataNode.xMap[thisID] = d.x; //update the parentDataNode's xMap with 'thisId' to be d.x
                 d.parentDataNode.yMap[thisID] = d.y; //update the parentDataNode's ymap with 'thisId' to be d.y
             });

             //start the force layout
             force.start();
             //set stop on child to be true
             //Todo: what's stopOnChild do? Stops the force layout when...?
             stopOnChild = true;

         }

         //If the graphType is not a force tree...
         if (graphType != "ForceTree") {
             //set up the visualization, add a new svg to the body
             vis = d3.select("body").append("svg:svg")
                 .attr("width", w)
                 .attr("height", h);

             //.append("g").call(d3.behavior.zoom().scaleExtent([0.01, 100]).on("zoom", thisContext.zoom))
             //.append("g");
         }
         //if the graphType is a force tree, add a new svg to the body
         else {
             vis = d3.select("body").append("svg:svg")
                 .attr("width", w)
                 .attr("height", h)
         }
     }

     // from http://blog.luzid.com/2013/extending-the-d3-zoomable-sunburst-with-labels/

     //Function to rotate the text as needed
     this.computeTextRotation = function(d) {
         var angle = x(d.x + d.dx / 2) - Math.PI / 2;
         return angle / Math.PI * 180;
     }

     //Function to zoom (at the moment, I do not think this is used/works)
     this.zoom = function() {
         vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
         thisContext.redrawScreen();
     }

     //get the dataset for the current visualization
     this.getDisplayDataset = function() {

         //If displayDataset already has a value, the function returns it
         if (displayDataset)
             return displayDataset;

         //Otherwise, initialize displayDataset to be an object with an array of nodes
         displayDataset = {
             nodes: []
         };

         //Initialize the index to be 0
         var index = 0;

         //add a child to displayDataset and then return it, given a node and an index
         //(gets the child from a node's children array and adds it to displayDataset)
         function addAndReturnChild(aNode, childIndex) {
             var newChildNode = aNode.children[childIndex]; //set newChildNode to be the node from aNode's array of children
             //of children at the given index
             var newDisplayNode = {}; //Initialize dictionary called newDisplayNode
             //Set the name to be "NAME_node'sindexnumber"
             newDisplayNode.name = "NAME_" + index;
             //increase the index by 1
             index++;
             //set newDisplayNode's fixed value to be true
             newDisplayNode.fixed = true;
             //add the newDisplayNode to displayDataset's list of nodes, displayDataset.nodes
             displayDataset.nodes.push(newDisplayNode);
             //set newDisplayNode's parent node to be newChildNode
             //In other words, the node/object added to displayDataset's list of nodes
             //"points" to the original node object from aNode's children
             newDisplayNode.parentDataNode = newChildNode;

             //If newChildNode has children...
             if (newChildNode.children) {
                 //update the children of newDisplayNode to be the same as newChildNode's children
                 newDisplayNode.children = [];
                 for (var x = 0; x < newChildNode.children.length; x++) {
                     newDisplayNode.children.push(addAndReturnChild(newChildNode, x));
                 }
             }
             //return newDisplayNode
             return newDisplayNode;
         }

         //initialize rootDisplayNode
         var rootDisplayNode = {};
         //set the name
         rootDisplayNode.name = "NAME_" + index;
         //add 1 to the index
         index++;
         //set rootDisplayNode's fixed property to false
         rootDisplayNode.fixed = false;
         //add rootDisplay node to displayDataset.nodes
         displayDataset.nodes.push(rootDisplayNode);
         //get rootDisplayNode's parentDataNode to point to statics.getRoot()
         rootDisplayNode.parentDataNode = statics.getRoot();
         //initialize rootDisplayNode's children to an empty list
         rootDisplayNode.children = [];

         //for each child in statics.getRoot, add the child to rootDisplayNode's list of children
         //in other words, copy statics.getRoot()'s children into rootDisplayNode.children
         for (var x = 0; x < statics.getRoot().children.length; x++)
             rootDisplayNode.children.push(addAndReturnChild(statics.getRoot(), x));
         //return the display data set
         return displayDataset;

     }

     //Function to set the width and height of the current visualization area
     this.setWidthAndHeight = function() {
         //if( isRunFromTopWindow ) 
         {
             w = thisWindow.innerWidth - 25,
             h = thisWindow.innerHeight - 25;
         }
         //else
         {
             //w =  thisWindow.innerWidth-25;
             //h = thisWindow.innerHeight;
         }

     }

     //Function to return 'thisID', the ID of this object
     this.getThisId = function() {
         return thisID;
     }

     // to be called on window call
     //Function that "clears" the visualization, removes the current visualization and force layout calculations
     this.unregister = function() {
         //removes the current "goObject" from statics list of go objects
         console.log("Got unregister " + thisID);
         statics.getGoObjects()[thisID] = null;

         //stops the force layout
         if (force) {
             force.stop();
         }

         //removes the current visualization if it was drawn
         if (vis) {
             vis.selectAll("text").remove()
             vis.selectAll("circle.node").remove();
             vis.selectAll("line.link").remove();
             vis.selectAll("line").remove();
         }
     }

     //Function to "redraw" all the current visualizations
     this.reVis = function(revisAll) {
         //If revisAll is set to true
         if (revisAll) {
             //set registered to be the list of current go objects
             registered = statics.getGoObjects();
             //for every id in the list of current go objects...
             for (id in registered)
                 if (registered[id]) {
                     //if registered has the id, call the function reVisOne() on its mapped value
                     //in other words, registered is a dictionary of go objects.
                     //the id is the key to a respective visualization/go object, and reVisOne() function is called on it
                     registered[id].reVisOne();
                 }
         } else {
             //if revisAll is false, just call reVisOne() on the current go object / this object
             this.reVisOne();
         }

     }

     //Function to update a go object / visualization
     this.reVisOne = function(resetPositions) {
         //set the width and height of the visualization area
         this.setWidthAndHeight();
         //if the graphType is not a force tree, set the initial positions
         if (graphType != "ForceTree")
             this.setInitialPositions();

         //if the graphType is not a force tree, remove all group elements, i.e. "g" elements
         if (graphType != "ForceTree")
             vis.selectAll("g").remove();

         //remove the current vis object
         vis.remove();

         //recalculate the force layout
         this.reforce();
         //set dirty to be true
         dirty = true;
         //update the current object
         this.update();
     }

     //Function to set Quantitative Dynamic Ranges
     this.setQuantitativeDynamicRanges = function() {
         //get value to color by...
         var chosen = aDocument.getElementById("colorByWhat");
         //get range to use, based on the chosen value
         var aRange = statics.getRanges()[chosen.value];
         //if isRunFromTopWindow is true...
         if (isRunFromTopWindow) {
             if (aRange == null) { //and if aRange is null...
                 //set aDocument's lowQuantRange.value to be categorical
                 aDocument.getElementById("lowQuantRange").value = "categorical";
                 //set aDocument's highQuantRange.value to be categorical
                 aDocument.getElementById("highQuantRange").value = "categorical";
                 //set aDocument's lowQuantRange.enabled to be false
                 aDocument.getElementById("lowQuantRange").enabled = false;
                 //set aDocument's highQuantRange.enabled to be false
                 aDocument.getElementById("highQuantRange").enabled = false;
             }
             //if the array aRange has values
             else {
                 //set aDocument's lowQuantRange.value to be aRange[0]
                 aDocument.getElementById("lowQuantRange").value = aRange[0];
                 //set aDocument's highQuantRange.value to be aRange[1]
                 aDocument.getElementById("highQuantRange").value = aRange[1];
             }
         }
         if (!firstUpdate) //If firstUpdate is false... if it's not the first update since the webpage loaded
             this.redrawScreen(); //then redraw the screen
     }
     //Function that adds individual dynamic menu content
     this.addIndividualMenuDynamicMenuContent = function() {
         //array to hold all names
         var allNames = [];
         // get this document element "scatterX"
         var scatterX = thisDocument.getElementById("scatterX")
         //get this document element "scatterY"
         var scatterY = thisDocument.getElementById("scatterY")

         //set xString to hold some html
         var xString = "<option value=\"circleX\">circleX</option>";
         //set yString to hold some html
         var yString = "<option value=\"circleY\">circleY</option>";

         //set scatterX's html to xString
         scatterX.innerHTML += xString;
         //set scatterY's html to yString
         scatterY.innerHTML += yString;
         //append yString to scaterX's current html
         scatterX.innerHTML += yString;
         //append xString to scatterY's current html
         scatterY.innerHTML += xString;

         //todo: these will be in a different order than other menus

         //push the objects in getRanges() to allNames
         for (prop1 in statics.getRanges())
             allNames.push(prop1);

         //push the objects in getOrdinalScales() to allNames
         for (prop2 in statics.getOrdinalScales())
             allNames.push(prop2);

         //loop through allNames...
         //add html to scatterX and scatterY with
         //"option values" of the property names in all names
         for (var x = 0; x < allNames.length; x++) {
             var propertyName = allNames[x];

             var selectHTML = "<option value=\"" + propertyName + "\">" + propertyName + "</option>"

             scatterX.innerHTML += selectHTML;
             scatterY.innerHTML += selectHTML;
         }

     }

     //Function to add dynamic menu content
     this.addDynamicMenuContent = function() {
         //If run from the top of the window, return immediately
         if (!isRunFromTopWindow)
             return;

         //get the sidebar element from the document
         var mySidebar = aDocument.getElementById("sidebar");
         //set the inner html of the sidebar

         //Sort select
         mySidebar.innerHTML += "<select id=\"sortByWhat\" onChange=myGo.resort()></select>"

         //Size select
         mySidebar.innerHTML += "<h3> Size: <h3>"
         var selectHTML = "<select id=\"sizeByWhat\" onchange=myGo.reVis(false)>"
         selectHTML += "</select>"
         mySidebar.innerHTML += selectHTML
         mySidebar.innerHTML += "<br>Max size: <input type=\"number\"" +
             " id=\"maxSize\" min=\"0\" max=\"100\" value=\"30\" onkeypress=\"return myGo.isNumber(event)\" onchange=myGo.reVis(false)></input>" +
             "<br>Min size: <input type=\"number\"" +
             " id=\"minSize\" min=\"0\" max=\"100\"  value=\"2\" onkeypress=\"return myGo.isNumber(event)\" onchange=myGo.reVis(false)></input>" +
             "<br><input type=\"checkbox\"" +
             "id=\"logSize\" onchange=myGo.reVis(false)>log</input>" + "<input type=\"checkbox\"" +
             "id=\"invertSize\" onchange=myGo.reVis(false)>invert</input><br>"

         //Data Menu
         var dataMenuHTML = "<li id=\"dataMenu\"><a>Data</a><ul>";
         //for every property name in nodes[0]...
         for (var propertyName in nodes[0])
         //if the property name is not forceTreeNodeID, x, y, children or fixed...
             if (propertyName != "forceTreeNodeID" && propertyName != "x" && propertyName != "y" && propertyName != "children" && propertyName != "fixed") {
                 //then... set isNumeric to true
                 var isNumeric = true;
                 //start building the inner html, start by adding the propertyName as an option value
                 var selectHTML = "<option value=\"" + propertyName + "\">" + propertyName + "</option>"
                 //initialize the range
                 var range = []
                 range[0] = nodes[0][propertyName]; //range[0] is nodes[0][propertyName]
                 range[1] = nodes[0][propertyName]; //range[1] is nodes[0][propertyName]

                 if (this.isNumber(range[0]) && this.isNumber(range[1])) {
                     range[0] = 1.0 * range[0]; // Multiply by 1.0 to cast to decimals? Todo: Update this comment
                     range[1] = 1.0 * range[1];
                 }

                 //loop through the nodes while isNumeric is true
                 for (var x = 0; isNumeric && x < nodes.length; x++) {
                     var aVal = nodes[x][propertyName];
                     //set isNumeric to false if the value is not a number
                     if (!this.isNumber(aVal)) {
                         isNumeric = false;
                     }
                     //otherwise... 
                     else {
                         //find min and max values...
                         aVal = 1.0 * aVal; //decimal casting
                         //store minimum value
                         if (aVal < range[0])
                             range[0] = aVal;
                         //store maximum value
                         if (aVal > range[1])
                             range[1] = aVal;
                     }
                 }

                 //set getRanges()[propertyName] to equal range (that was built above) if isNumeric is true
                 if (isNumeric) {
                     statics.getRanges()[propertyName] = range;
                 }
                 //if isNumeric is false, use built-in d3 scales...
                 //set getOrdinalScales()[propertyName] to be d3.scale.ordinal() and
                 //set getColorScales()[propertyName] to be d3.scale.category20b()
                 else {
                     statics.getOrdinalScales()[propertyName] = d3.scale.ordinal();
                     statics.getColorScales()[propertyName] = d3.scale.category20b();
                 }

                 //append the sizeBy inner html to the current selectHTML
                 aDocument.getElementById("sizeByWhat").innerHTML += selectHTML
                 //append the sortBY inner html to the current selectHTML
                 aDocument.getElementById("sortByWhat").innerHTML += selectHTML

                 //if the propertyName is not xMap, yMap, xMapNoise, or yMapNoise...
                 if (propertyName != "xMap" && propertyName != "yMap" && propertyName != "xMapNoise" && propertyName != "yMapNoise")
                 //append html to dataMenuHTML with a list item id called dataRange with the current propertyName
                     dataMenuHTML +=
                         "<li id=\"dataRange" + propertyName + "\"><a>" + propertyName + " </a></li>"
                     //push "dataRange" + propertyName to the list of data names
                 dataNames.push("dataRange" + propertyName);
             }
             //append a closing to the unordered list and a closing to the list item to dataMenuHTML
         dataMenuHTML += "</ul></li>";

         //loop through dataNames
         //(dataNames.push returns the current length of dataNames)
         for (var x = 0; x < dataNames.push; x++) {
             var innerString = "";
             //create html for 5 list items
             for (var y = 0; y < 5; y++)
                 innerString += "<li>Number " + x + "</li>";
             //append html for 5 list items to the innerHTML of the element "dataNames" in the document
             innerString += "";
             aDocument.getElementById(dataNames).innerHTML += innerString;
         }

         //add the dataMenuHTML to the inner HTML of the nav element (the navigation bar)
         aDocument.getElementById("nav").innerHTML += dataMenuHTML;

         //add the text header for Color to the side bar
         mySidebar.innerHTML += "<h3> Color: <h3>";
         //create HTML for color by...
         //... using colorByQuantitativeDynamicRanges()
         selectHTML = "<select id=\"colorByWhat\" onchange=myGo.setQuantitativeDynamicRanges()>"
         //create HTML to select node depth
         selectHTML += "<option value=\"nodeDepth" + "\">" + "node depth" + "</option>"

         //loop through the property names
         for (var propertyName in nodes[0])
             if (propertyName != "forceTreeNodeID" && propertyName != "x" && propertyName != "y" && propertyName != "children" && propertyName != "fixed" && propertyName != "nodeDepth") {
                 //if propertyName is not forceTreeNodeID, x, y, children, fixed or nodeDepth...
                 //create the HTML for the propertyName
                 selectHTML += "<option value=\"" + propertyName + "\">" + propertyName + "</option>"

             }

             //create HTML for color by marked
         selectHTML += "<option value=\"colorByMarked" + "\">" + "marked" + "</option>"

         //append the HTML to end the "select" element
         selectHTML += "</select>"
         //append the current selectHTML to the sidebar's inner HTML
         mySidebar.innerHTML += selectHTML
         //append the logColor checkbox to the sidebar
         mySidebar.innerHTML += "<br><input type=\"checkbox\"" +
             "id=\"logColor\" onchange=myGo.redrawScreen()>log</input>"
         //append the textIsBlack checkbox to the side bar
         mySidebar.innerHTML += "<input type=\"checkbox\" id=\"textIsBlack\"" +
             "onchange=myGo.redrawScreen()>text always black</input>";
         //create list item HTML for Labels
         var labelHTML = "<li><a>Labels</a><ul>";
         //append HTML for checkbox for circle label scheme
         labelHTML += "<li><input type=\"checkbox\" id=\"cicleLabelScheme\"" +
             "onchange=myGo.redrawScreen() checked=true>" +
             "Smart circular labels</input><br><input type=\"checkbox\" id=\"labelOnlyTNodes\"" +
             "onchange=myGo.redrawScreen()> Label only T-Nodes</input></li>"
         //loop through the property names...
         for (var propertyName in nodes[0])
             if (propertyName != "forceTreeNodeID" && propertyName != "x" && propertyName != "y") {
                 //if the property name isn't forceTreeNodeID, x, or y, create the html for the property name and add as a list item
                 var newHTML = "<li><input type=\"checkbox\" id=\"label" + propertyName + "\"" +
                     "onchange=myGo.redrawScreen()>" + propertyName + "</input></li>";

                 labelHTML += newHTML;
                 //add the new label/checkbox html to the list of check boxes stored in statics
                 statics.getLabelCheckBoxes().push("label" + propertyName);
             }

             //create HTML for adjusting the font of the visualization
         labelHTML += "<li>Font Adjust <input type=\"range\" id=\"fontAdjust\""
         labelHTML += "min=\"5\" max=\"25\" value=\"15\" onchange=myGo.redrawScreen()></input></li>"
         labelHTML += "</ul></li>"
         //add it to the navigation bar
         aDocument.getElementById("nav").innerHTML += labelHTML;

         //create html for filtering...
         mySidebar.innerHTML += "<h3> Filter: <h3>"
         mySidebar.innerHTML += "node depth: <input type=\"number\" id=\"depthFilter\" onkeypress=\"return myGo.isNumber(event)\" " +
             " min=\"2\" " +
             "max=\" ranges[\"nodeDepth\"] value=2 onchange=myGo.setTopNodes()></input><br>";
         var rangeHTML = "Depth Filter:<input type=\"range\" id=\"depthFilterRange\" min=\"0\" " +
             "max=\"" + topNodes.length + "\" value=\"0\" onchange=myGo.setTopNodes()><br></input>";
         mySidebar.innerHTML += rangeHTML;
         //set the top nodes
         this.setTopNodes();

         //create a table of data about nodes and t nodes
         var aTable = ""
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
         //add the table html to the side bar
         mySidebar.innerHTML += aTable;

     }

     //Function to set the top nodes
     this.setTopNodes = function() {
         topNodes = [];

         for (var x = 0; x < nodes.length; x++) {
             if (nodes[x].nodeDepth == aDocument.getElementById("depthFilter").value) {
                 topNodes.push(nodes[x]);
             }
         }

         if (isRunFromTopWindow)
             aDocument.getElementById("depthFilterRange").max = topNodes.length;

         this.showOnlyMarked(true);
     }

     //Function to show only the marked nodes
     //Todo: Update this comment and explain this function more in depth
     this.showOnlyMarked = function(withRedraw) {
         var aVal = aDocument.getElementById("depthFilterRange").value;
         if (aVal == 0) {
             for (var x = 0; x < nodes.length; x++)
                 nodes[x].doNotShow = false;
         } else {
             for (var x = 0; x < nodes.length; x++)
                 nodes[x].doNotShow = true;
             aVal = aVal - 1;
             var myNode = topNodes[aVal];

             function markSelfAndDaughters(aNode) {
                 aNode.doNotShow = false;

                 if (aNode.children != null) {
                     for (var y = 0; y < aNode.children.length; y++) {
                         markSelfAndDaughters(aNode.children[y]);
                     }
                 }
             }
             markSelfAndDaughters(myNode);
         }
         statics.getRoot().doNotShow = false;
         if (withRedraw) {
             dirty = true;
             this.redrawScreen();
         }

     }

     //Function to redraw the screens
     //Calls redrawAScreen on all registered listeners
     this.redrawScreen = function() {
         registered = statics.getGoObjects();
         for (id in registered)
             if (registered[id]) {
                 registered[id].redrawAScreen();
             }
     }

     //Function to redraw a screen
     this.redrawAScreen = function() {
         aDocument.getElementById("logSize").enabled = true;
         aBox = aDocument.getElementById("logColor").enabled = true;


         //Todo: Fix this commented out code?

         /* right now these are getting stuck in the off position
    // can't log an ordinal color scale...
    if(  statics.getOrdinalScales()[ aDocument.getElementById("sizeByWhat").value] != null )  
    {
        aBox = aDocument.getElementById("logSize");
        aBox.checked=false;
        aBox.enabled=false;
    }
    else
    {
        aDocument.getElementById("logSize").enabled=true;
    }
    
    // can't log an ordinal color scale...
    if(  statics.getOrdinalScales()[ aDocument.getElementById("colorByWhat").value] != null )  
    {
        aBox = aDocument.getElementById("logColor");
        aBox.checked=false;
        aBox.enabled=false;
    }
    else
    {
        aBox = aDocument.getElementById("logColor").enabled=true;
    }
    */
         // << << << < HEAD

         dirty = true;
         this.update()
     }


     //Function to get label text of nodes
     this.getLabelText = function(d) {
         if (d.marked == false && aDocument.getElementById("labelOnlyTNodes").checked)
             return "";

         var returnString = "";

         for (var propertyName in nodes[0]) {
             var aCheckBox = aDocument.getElementById("label" + propertyName);
             if (aCheckBox != null && aCheckBox.checked) {
                 returnString += d[propertyName] + " ";
             }
         }

         if (aDocument.getElementById("cicleLabelScheme").checked && graphType == "ForceTree" ||
             ((thisDocument.getElementById("scatterX").value == "circleX" ||
                     thisDocument.getElementById("scatterX").value == "circleY") ||
                 (thisDocument.getElementById("scatterY").value == "circleX" || thisDocument.getElementById("scatterY").value == "circleY"))) {

             if (circleDraws[d.nodeDepth] == returnString) {
                 return "";
             }

         }

         circleDraws[d.nodeDepth] = "" + returnString;


         return returnString;
     }

     //Function to tell if nodes are filtered
     //if d.parentDataNode.doNotShow is false (if false, returns true) or not (false is returned) of a given object
     //i.e., if nodes are filtered... return true
     this.myFilterNodes = function(d) {
         if (d.parentDataNode.doNotShow == false)
             return true;

         return false;
     }
     //Function to tell if links are filtered
     //if links are filtered... return true
     this.myFilterLinks = function(d) {
         if (d.source.parentDataNode.doNotShow == true || d.target.parentDataNode.doNotShow == true)
             return false;

         return true;

     }
     //Function to adjust the gravity of the force layout
     this.gravityAdjust = function() {
         if (graphType != "ForceTree") {
             myGo.setInitialPositions();
         }

         myGo.redrawScreen();
     }

     // from http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric

     //Function to check to see if a given object is a number
     this.isNumber = function(n) {
         return !isNaN(parseFloat(n)) && isFinite(n);
     }

     //Function to get a scale based on data given and if an xAxis is given
     this.getAVal = function(d, xAxis) {
         //if the graph is a force tree...
         if (graphType == "ForceTree") {
             //if there's an xAxis, return d.x; otherwise return d.y
             return xAxis ? d.x : d.y;
         }

         d = d.parentDataNode; //get the parent node of d

         chosen = null; //initialize chosen to null

         //if there is an xAxis...
         if (xAxis) {
             //set chosen to be the "scatterX" value
             chosen = thisDocument.getElementById("scatterX").value;
         } else {
             //if there is not an xAxis, set chosen to be the "scatterY" value
             chosen = thisDocument.getElementById("scatterY").value;
         }

         //if chosen is equal to "circleX"...
         if (chosen == "circleX")
         //return the xMap[thisID] of d
             return d.xMap[thisID];

         //if chosen is equal to "circleY"...
         if (chosen == "circleY")
         //return the yMap[thisID] of d
             return d.yMap[thisID];

         // quantitative scale
         // if the chosen value in statics.getRanges() is not null... 
         if (statics.getRanges()[chosen] != null) {
             //initialize aRange to statics.getRanges() at the chosen value
             var aRange = statics.getRanges()[chosen];
             //initialize aScale to the domain of aRange and the range (between 0 and the width if there is an xAxis, otherwise b/t 0 and the height)
             var aScale = d3.scale.linear().domain(aRange).range([0, xAxis ? w : h]);
             //return the aScale of d at the chosen value
             return aScale(d[chosen]);
         } else {
             //get the ordinalScale at the chosen value
             statics.getOrdinalScales()[chosen].
             //set the range (between 0 and the width if there is an xAxis, otherwise b/t 0 and the height)
             range([0, xAxis ? w : h]);
             //return the ordinal scale of getOrdinalScales()[chosen](d[chosen])
             return statics.getOrdinalScales()[chosen](d[chosen]);
         }

     }

     //Function to add an Axis
     this.addAxis = function(chosen, isXAxis) {
         if (chosen == "circleX" || chosen == "circleY")
             return;

         if (statics.getRanges()[chosen] != null) {
             if (isXAxis) {
                 var aRange = statics.getRanges()[chosen];
                 var aScale = d3.scale.linear().domain(aRange).
                 range([0, w]);
                 var xAxis = d3.svg.axis()
                     .scale(aScale)
                     .orient("bottom");
                 vis.append("svg:svg").call(xAxis);
             } else {
                 var aRange = statics.getRanges()[chosen];
                 var aScale = d3.scale.linear().domain(aRange).
                 range([0, h]);
                 var yAxis = d3.svg.axis()
                     .scale(aScale)
                     .orient("right");
                 vis.append("svg:svg").call(yAxis);
             }
         }
     }

     //Function to get a radius value
     this.getRadiusVal = function(d) {
         var propToSize = aDocument.getElementById("sizeByWhat").value
         var returnVal = aDocument.getElementById("maxSize").value;
         var minValue = aDocument.getElementById("minSize").value * 1.0;
         var maxValue = aDocument.getElementById("maxSize").value * 1.0;
         var aRange = maxValue - minValue;


         // quantitative values
         if (statics.getRanges()[propToSize] != null) {
             if (aDocument.getElementById("logSize").checked) {
                 if (d[propToSize] > 0) // a p-value of zero yields a maximum sized radius
                 {
                     maxScale = Math.log(statics.getRanges()[propToSize][1]) / Math.LN10;
                     var aValue = Math.log(d[propToSize]) / Math.LN10;

                     var partial = aValue / maxScale;
                     partial = partial * aRange;
                     returnVal = minValue + partial;
                 }
             } else {
                 var aValue = 1.0 * d[propToSize];

                 var partial = (aValue - statics.getRanges()[propToSize][0]) / (statics.getRanges()[propToSize][1] - statics.getRanges()[propToSize][0]);

                 partial = partial * aRange;
                 returnVal = minValue + partial;
             }

         } else //ordinal values 
         {
             statics.getOrdinalScales()[propToSize].range(minValue, maxValue);

             returnVal = statics.getOrdinalScales()[propToSize](d[propToSize]);

         }

         if (aDocument.getElementById("invertSize").checked) {
             returnVal = maxValue - returnVal;
         }

         if (returnVal < minValue)
             returnVal = minValue;

         if (returnVal > maxValue)
             returnVal = maxValue;

         return returnVal;

     }
     var updateNum = 0;

     //Function to toggle the visibility of side bars
     this.toggleVisibilityOfSidebars = function() {
         var registered = statics.getGoObjects();
         for (id in registered)
             if (registered[id]) {
                 registered[id].getThisDocument().getElementById("sidebar").style.backgroundColor = "#ffffff";

                 var aDoc = registered[id].getThisDocument();

                 if (aDoc) {
                     if (aDocument.getElementById("showLeftControl").checked) {
                         aDoc.getElementById("sidebar").style.visibility = "visible";
                     } else {
                         aDoc.getElementById("sidebar").style.visibility = "hidden";
                     }
                 } else {
                     console.log("Could not get doc for " + id);
                 }
             }


         if (aDocument.getElementById("showRightDataPanel").checked) {
             aDocument.getElementById("rightInfoArea").style.visibility = "visible";

         } else {
             aDocument.getElementById("rightInfoArea").style.visibility = "hidden";
         }

         aDocument.getElementById("rightInfoArea").style.backgroundColor = "#ffffff";

     }

     //Function to handle keyboard events
     this.handleKeyboardEvent = function(e) {
         // modded from http://stackoverflow.com/questions/4368036/how-to-listener-the-keyboard-type-text-in-javascript
         e = e || thisWindow.event;
         var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
         if (charCode) {
             if (String.fromCharCode(charCode) == "A" || String.fromCharCode(charCode) == 'a') {
                 thisContext.arrangeForcePlot(true);
             } else if (String.fromCharCode(charCode) == "T" || String.fromCharCode(charCode) == 't') {
                 thisContext.arrangeForcePlot(false);
             } else if (String.fromCharCode(charCode) == "L" || String.fromCharCode(charCode) == 'l') {
                 if (thisContext.getParentDocument().getElementById("showLeftControl").checked) {
                     thisContext.getParentDocument().getElementById("showLeftControl").checked = false;
                 } else {
                     thisContext.getParentDocument().getElementById("showLeftControl").checked = true;
                 }


                 thisContext.toggleVisibilityOfSidebars();
             } else if (String.fromCharCode(charCode) == "R" || String.fromCharCode(charCode) == 'r') {
                 if (thisContext.getParentDocument().getElementById("showRightDataPanel").checked) {
                     thisContext.getParentDocument().getElementById("showRightDataPanel").checked = false;
                 } else {
                     thisContext.getParentDocument().getElementById("showRightDataPanel").checked = true;
                 }

                 thisContext.toggleVisibilityOfSidebars();
             } else if (String.fromCharCode(charCode) == "V" || String.fromCharCode(charCode) == 'v') {
                 thisContext.hideAndShow();
                 thisContext.redrawScreen();
             } else if (String.fromCharCode(charCode) == "Q" || String.fromCharCode(charCode) == 'q') {
                 var aVal = parseFloat(aDocument.getElementById("localGravity").value);
                 aVal = aVal + 0.5;
                 aDocument.getElementById("localGravity").value = aVal
             } else if (String.fromCharCode(charCode) == "W" || String.fromCharCode(charCode) == 'w') {
                 var aVal = parseFloat(aDocument.getElementById("localGravity").value);
                 aVal = aVal - 0.5;
                 aDocument.getElementById("localGravity").value = aVal
             }
         }
     }



     // from http://stackoverflow.com/questions/7295843/allow-only-numbers-to-be-typed-in-a-textbox

     //Function to check to see if an event is a number
     this.isNumber = function(evt) {
         evt = (evt) ? evt : window.event;
         var charCode = (evt.which) ? evt.which : evt.keyCode;

         if (charCode == 46) //decimal places are allowed
             return true;

         if (charCode > 31 && (charCode < 48 || charCode > 57)) {
             return false;
         }
         return true;
     }

     //Function to update
     this.update = function() {
         if (!initHasRun)
             return;

         if (dirty) {
             if (animationOn == false && stopOnChild == false) {
                 dataset = thisContext.getDisplayDataset();
                 for (var x = 0; x < dataset.nodes.length; x++) {
                     if (!dataset.nodes[x].userMoved) {
                         dataset.nodes[x].x = dataset.nodes[x].parentDataNode.xMap[thisID]
                         dataset.nodes[x].y = dataset.nodes[x].parentDataNode.yMap[thisID]
                     }
                 }
             }



             dirty = false;
             var anyLabels = false;

             for (var x = 0; x <= statics.getMaxLevel(); x++) {
                 circleDraws[x] = "";
             }


             for (var x = 0; !anyLabels && x < statics.getLabelCheckBoxes().length; x++) {
                 var aCheckBox = aDocument.getElementById(statics.getLabelCheckBoxes()[x]);

                 if (aCheckBox != null)
                     anyLabels = aCheckBox.checked
             }

             var noiseValue = aDocument.getElementById("noiseSlider").value;

             var numMarked = 0;
             var numVisible = 0;
             for (var i = 0; i < nodes.length; i++) {
                 nodes[i].marked = false;
                 if (!nodes[i].doNotShow && nodes[i].setVisible == true) {
                     nodes[i].marked = true;
                     numVisible++;

                     if (nodes[i].children != null) {
                         for (var j = 0; nodes[i].marked && j < nodes[i].children.length; j++) {
                             if (!nodes[i].children[j].doNotShow) {
                                 nodes[i].marked = false;
                             }
                         }
                     }

                     if (nodes[i].marked == true)
                         numMarked = numMarked + 1
                 }

                 if (addNoise) {
                     if (firstNoise) {
                         nodes[i].xMapNoise = nodes[i].xMap[thisID];
                         nodes[i].yMapNoise = nodes[i].yMap[thisID];
                     } else {
                         nodes[i].xMap[thisID] = nodes[i].xMapNoise;
                         nodes[i].yMap[thisID] = nodes[i].yMapNoise;

                     }

                     var noiseX = 0.1 * nodes[i].xMap[thisID] * Math.random() * (noiseValue / 100);
                     var noiseY = 0.1 * nodes[i].yMap[thisID] * Math.random() * (noiseValue / 100);

                     if (Math.random() < 0.5)
                         noiseX = -noiseX;

                     if (Math.random() < 0.5)
                         noiseY = -noiseY;

                     nodes[i].xMap[thisID] += noiseX;
                     nodes[i].yMap[thisID] += noiseY;

                 }
             }

             if (addNoise)
                 firstNoise = false;

             for (var i = 0; i < nodes.length; i++) {
                 nodes[i].thisNodeColor = this.color(nodes[i]);
                 nodes[i].thisNodeRadius = this.getRadiusVal(nodes[i]);
             }

             var filteredNodes = thisContext.getDisplayDataset().nodes.filter(thisContext.myFilterNodes)
             vis.selectAll("text").remove();


             // Restart the force layout.
             if (graphType == "ForceTree") {
                 force.nodes(filteredNodes);

                 if (!aDocument.getElementById("hideLinks").checked) {
                     links = d3.layout.tree().links(filteredNodes);
                     force.links(links)
                 } else {
                     links = d3.layout.tree().links([]);
                     force.links(links);
                 }


                 if (stopOnChild == true || animationOn == true)
                     force.start().gravity(aDocument.getElementById("gravitySlider").value / 100);
             }

             var node = vis.selectAll("circle.node")
                 .data(filteredNodes, function(d) {
                     return d.name;
                 })
                 .style("fill", function(d) {
                     return d.parentDataNode.thisNodeColor
                 })
                 .style("opacity", aDocument.getElementById("opacitySlider").value / 100);


             // Enter any new nodes.
             node.enter().append("svg:circle").on("click", this.myClick)
                 .attr("class", "node")
                 .attr("r", function(d) {
                     return d.parentDataNode.thisNodeRadius
                 })
                 .style("fill", function(d) {
                     return d.parentDataNode.thisNodeColor
                 }).
             style("opacity", aDocument.getElementById("opacitySlider").value / 100)
                 .on("mouseenter", this.myMouseEnter)
                 .on("mouseleave", this.myMouseLeave)

             node.attr("cx",
                 function(d) {

                     return thisContext.getAVal(d, true)
                 }
             )
                 .attr("cy",

                     function(d) {

                         return thisContext.getAVal(d, false)
                     }
             )


             if (graphType == "ForceTree") {
                 node.call(force.drag);
             }

             //Function to update node-links text
             function updateNodesLinksText() {
                 //console.log("tick " + dragging);

                 if (!animationOn && (stopOnChild == true || dragging == true)) {
                     var dataset = thisContext.getDisplayDataset();

                     for (var x = 0; x < dataset.nodes.length; x++) {
                         if (!dataset.nodes[x].userMoved) {
                             dataset.nodes[x].x = dataset.nodes[x].parentDataNode.xMap[thisID]
                             dataset.nodes[x].y = dataset.nodes[x].parentDataNode.yMap[thisID]
                         }

                         if (animationOn == false)
                             dataset.nodes[x].fixed = true;
                     }

                     if (force && animationOn == false && dragging == false)
                         force.stop();

                     if (stopOnChild == true)
                         stopOnChild = false;

                 }

                 node.attr("cx",
                     function(d) {

                         return thisContext.getAVal(d, true)
                     }
                 )
                     .attr("cy",

                         function(d) {

                             return thisContext.getAVal(d, false)
                         }
                 )

                 if (anyLabels) {
                     if (graphType == "ForceTree") {

                         text.attr("transform", function(d) {
                             return "translate(" +
                                 d.x + "," + d.y + ")";
                         });

                     } else {
                         /* radial labels: todo: this should be an option
=======
    
    dirty = true;
    this.update()
  }

  

this.getLabelText = function(d)
{   
    if( d.marked == false && aDocument.getElementById("labelOnlyTNodes").checked  )
        return "";
    
    var returnString ="";
    
    for( var propertyName in nodes[0])
    {
        var aCheckBox = aDocument.getElementById("label" + propertyName);
        if( aCheckBox != null &&  aCheckBox.checked)
        {
            returnString += d[propertyName] + " ";
        }
    }
    
    if(  aDocument.getElementById("cicleLabelScheme").checked  && graphType=="ForceTree" )
    {

            if( circleDraws[d.nodeDepth] ==  returnString)  
            {
                return "";  
            }
            
    }
    
    circleDraws[d.nodeDepth] =  "" +  returnString;
    
    
    return returnString;    
}

this.myFilterNodes = function(d)
{
     if( d.parentDataNode.doNotShow == false)
        return true;
        
     return false;
}

this.myFilterLinks= function(d)
{
     if( d.source.parentDataNode.doNotShow == true|| d.target.parentDataNode.doNotShow == true)
            return false;
        
      return true;
            
}

this.gravityAdjust = function()
{
        if  (graphType !=  "ForceTree")     
        {
            myGo.setInitialPositions();
        }   
        
        myGo.redrawScreen();
}

// from http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
this.isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

this.getAVal = function (d, xAxis)
{
    if( graphType == "ForceTree" )
    {
        return xAxis? d.x: d.y; 
    }
    
    d = d.parentDataNode;
    
    chosen = null;
    
    if( xAxis)
    {
        chosen = thisDocument.getElementById("scatterX").value;
    }
    else
    {
        chosen = thisDocument.getElementById("scatterY").value;
    }
    
    if( chosen == "circleX" )
        return d.xMap[thisID];
        
    if( chosen == "circleY" ) 
        return d.yMap[thisID];
        
    // quantitative scale 
    if( statics.getRanges()[chosen] != null)
    {   
        var aRange = statics.getRanges()[chosen];
        var aScale = d3.scale.linear().domain(aRange).
            range([0, xAxis ? w : h]);
        return aScale(d[chosen]);
    }
    else
    {
        statics.getOrdinalScales()[chosen].
            range([0, xAxis ? w : h]); 
            
        return statics.getOrdinalScales()[chosen](d[chosen]);
    }
    
}
        
this.addAxis = function(chosen, isXAxis)
{
    if( chosen == "circleX" || chosen == "circleY")
        return;
        
    if( statics.getRanges()[chosen] != null)
    {   
        if( isXAxis)
        {
                var aRange = statics.getRanges()[chosen];
        var aScale = d3.scale.linear().domain(aRange).
                    range([0, w]);
        var xAxis = d3.svg.axis()
                  .scale(aScale)
                  .orient( "bottom");
        vis.append("svg:svg").call(xAxis); 
        }
        else
        {
        var aRange = statics.getRanges()[chosen];
        var aScale = d3.scale.linear().domain(aRange).
                    range([0, h]);
        var yAxis = d3.svg.axis()
                  .scale(aScale)
                  .orient( "right");
        vis.append("svg:svg").call(yAxis); 
        }
      }
}

this.getRadiusVal= function(d)
{
    var propToSize = aDocument.getElementById("sizeByWhat").value
    var returnVal = aDocument.getElementById("maxSize").value;
    var minValue = aDocument.getElementById("minSize").value * 1.0 ;
    var maxValue= aDocument.getElementById("maxSize").value * 1.0 ;
    var aRange = maxValue- minValue;
    
    
    // quantitative values
    if( statics.getRanges()[propToSize] != null)
    {
        if( aDocument.getElementById("logSize").checked) 
        {
            if( d[propToSize] >0) // a p-value of zero yields a maximum sized radius
            {
                maxScale = Math.log(statics.getRanges()[propToSize][1]) / Math.LN10; 
                var aValue = Math.log( d[propToSize]  ) / Math.LN10;
                
                var partial = aValue / maxScale;
                partial = partial * aRange;
                returnVal = minValue + partial;
            }
        }
        else
        {
            var aValue = 1.0 * d[propToSize] ;
            
            var partial = ( aValue- statics.getRanges()[propToSize][0] )
                            / (statics.getRanges()[propToSize][1] - statics.getRanges()[propToSize][0]);
            
            partial = partial *  aRange;
            returnVal = minValue +  partial;    
        }
            
    }
    else //ordinal values 
    {
        statics.getOrdinalScales()[propToSize].range(minValue,maxValue); 
                    
        returnVal = statics.getOrdinalScales()[propToSize](d[propToSize]);
        
    }
    
    if( aDocument.getElementById("invertSize").checked ) 
    {
        returnVal = maxValue- returnVal;
    }
    
    if( returnVal < minValue)
        returnVal = minValue;
        
    if( returnVal > maxValue)
        returnVal = maxValue;
    
    return returnVal;
    
}
var updateNum=0;

this.toggleVisibilityOfSidebars =function()
{
    var registered = statics.getGoObjects();
    for (id in registered) if (registered[id])
    {
        registered[id].getThisDocument().getElementById("sidebar").style.backgroundColor="#ffffff";
        
        var aDoc =registered[id].getThisDocument(); 
        
        if( aDoc ) 
        {
            if( aDocument.getElementById("showLeftControl").checked )
            { 
                aDoc.getElementById("sidebar").style.visibility="visible";
            }
            else
            {
                aDoc.getElementById("sidebar").style.visibility="hidden";
            }
        }
        else
        {
            console.log("Could not get doc for " + id);
        }
    }
    
    
    if( aDocument.getElementById("showRightDataPanel").checked ) 
    {
        aDocument.getElementById("rightInfoArea").style.visibility="visible";
        
    }
    else
    {
        aDocument.getElementById("rightInfoArea").style.visibility="hidden";
    }
        
    aDocument.getElementById("rightInfoArea").style.backgroundColor="#ffffff";
        
}

this.handleKeyboardEvent = function(e)
{
    // modded from http://stackoverflow.com/questions/4368036/how-to-listener-the-keyboard-type-text-in-javascript
    e = e || thisWindow.event;
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
    if (charCode) 
    {
        if( String.fromCharCode(charCode) == "A" || String.fromCharCode(charCode) == 'a')
        {
            thisContext.arrangeForcePlot(true);
        }
        else if( String.fromCharCode(charCode) == "T" || String.fromCharCode(charCode) == 't')
        {
            thisContext.arrangeForcePlot(false);
        }
        else if( String.fromCharCode(charCode) == "L" || String.fromCharCode(charCode) == 'l')
        {
            if( thisContext.getParentDocument().getElementById("showLeftControl").checked )
            {
                thisContext.getParentDocument().getElementById("showLeftControl").checked =false;
            }
            else
            {
                thisContext.getParentDocument().getElementById("showLeftControl").checked =true;
            }
            
            
            thisContext.toggleVisibilityOfSidebars();
        }
        else if( String.fromCharCode(charCode) == "R" || String.fromCharCode(charCode) == 'r')
        {
            if( thisContext.getParentDocument().getElementById("showRightDataPanel").checked )
            {
                thisContext.getParentDocument().getElementById("showRightDataPanel").checked =false;
            }
            else
            {
                thisContext.getParentDocument().getElementById("showRightDataPanel").checked =true;
            }
            
            thisContext.toggleVisibilityOfSidebars();
        }
        else if ( String.fromCharCode(charCode) == "V" || String.fromCharCode(charCode) == 'v')
        {
            thisContext.hideAndShow();
            thisContext.redrawScreen();
        }
        else if ( String.fromCharCode(charCode) == "Q" || String.fromCharCode(charCode) == 'q')
        {
            var aVal = parseFloat( aDocument.getElementById("localGravity").value);
            aVal = aVal + 0.5;
            aDocument.getElementById("localGravity").value = aVal
        }
        else if ( String.fromCharCode(charCode) == "W" || String.fromCharCode(charCode) == 'w')
        {
            var aVal = parseFloat( aDocument.getElementById("localGravity").value);
            aVal = aVal - 0.5;
            aDocument.getElementById("localGravity").value = aVal
        }
    }
}



    // from http://stackoverflow.com/questions/7295843/allow-only-numbers-to-be-typed-in-a-textbox
    this.isNumber = function(evt) {
evt = (evt) ? evt : window.event;
var charCode = (evt.which) ? evt.which : evt.keyCode;

if( charCode == 46)  //decimal places are allowed
    return true;

if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
}
return true;
}

this.update = function() 
{
    if( ! initHasRun )
        return;
    
    if( dirty ) 
    {
        if( animationOn == false && stopOnChild == false)
        {
            dataset = thisContext.getDisplayDataset();
            for( var x=0; x < dataset.nodes.length; x++)
            {
                if( ! dataset.nodes[x].userMoved )
                {
                    dataset.nodes[x].x = dataset.nodes[x].parentDataNode.xMap[thisID]
                    dataset.nodes[x].y = dataset.nodes[x].parentDataNode.yMap[thisID]                           
                }
            }
        }
        
            
        
        dirty = false;
        var anyLabels = false;
        
        for( var x=0; x<= statics.getMaxLevel(); x++ )
        {
            circleDraws[x] = "";
        }
        
        
        for( var x=0; ! anyLabels && x < statics.getLabelCheckBoxes().length; x++)
        {
            var aCheckBox = aDocument.getElementById(statics.getLabelCheckBoxes()[x]);
            
            if( aCheckBox != null) 
                anyLabels = aCheckBox.checked
        }
        
        var noiseValue = aDocument.getElementById("noiseSlider").value;
        
        var numMarked =0;
        var numVisible=0;
        for (var i = 0; i < nodes.length; i++)
        {
            nodes[i].marked= false;
            if( ! nodes[i].doNotShow &&  nodes[i].setVisible== true) 
            {
                nodes[i].marked = true;
                numVisible++;
                
                if( nodes[i].children != null) 
                {
                    for( var j=0; nodes[i].marked && j < nodes[i].children.length; j++ ) 
                    {
                        if( ! nodes[i].children[j].doNotShow )
                        {
                            nodes[i].marked=false;
                        }
                    }
                }
                
                if( nodes[i].marked == true) 
                    numMarked = numMarked + 1
            }
            
            if( addNoise )
            {
                if( firstNoise)
                {
                    nodes[i].xMapNoise  = nodes[i].xMap[thisID];
                    nodes[i].yMapNoise  = nodes[i].yMap[thisID];
                }
                else
                {
                    nodes[i].xMap[thisID]=nodes[i].xMapNoise ;
                    nodes[i].yMap[thisID]= nodes[i].yMapNoise;
                    
                }
            
                var noiseX = 0.1 * nodes[i].xMap[thisID]* Math.random() * (noiseValue/100);
                var noiseY = 0.1 * nodes[i].yMap[thisID]* Math.random() * (noiseValue/100);
                
                if( Math.random() < 0.5) 
                    noiseX = -noiseX;
                    
                if( Math.random() < 0.5) 
                    noiseY = -noiseY;
                    
                nodes[i].xMap[thisID] += noiseX;
                nodes[i].yMap[thisID] += noiseY;
                
            }
        }
        
        if( addNoise) 
            firstNoise = false;
        
        for (var i = 0; i < nodes.length; i++)
        {
            nodes[i].thisNodeColor = this.color(nodes[i]);
            nodes[i].thisNodeRadius = this.getRadiusVal(nodes[i]);
        }   
        
        var filteredNodes = thisContext.getDisplayDataset().nodes.filter(thisContext.myFilterNodes)
        vis.selectAll("text").remove();
        
    
    // Restart the force layout.
     
     if( graphType == "ForceTree"  ) 
     {
        force.nodes(filteredNodes);
          
        if(! aDocument.getElementById("hideLinks").checked )
        {
            links = d3.layout.tree().links(filteredNodes);
            force.links(links)  
        }
        else
        {
            links = d3.layout.tree().links([]);
            force.links(links);
        }
        
        
        if(stopOnChild == true || animationOn == true)
            force.start().gravity(aDocument.getElementById("gravitySlider").value/100);
     }
     
      var node = vis.selectAll("circle.node")
          .data(filteredNodes, function(d) {return d.name; } )
          .style("fill", function(d) { return d.parentDataNode.thisNodeColor} )
          .style("opacity",aDocument.getElementById("opacitySlider").value/100 );
    
    
      // Enter any new nodes.
     node.enter().append("svg:circle").on("click", this.myClick)
          .attr("class", "node")
          .attr("r", function(d) {  return d.parentDataNode.thisNodeRadius})
          .style("fill", function(d) { return d.parentDataNode.thisNodeColor}).
          style("opacity",aDocument.getElementById("opacitySlider").value/100 ) 
         .on("mouseenter", this.myMouseEnter)
          .on("mouseleave", this.myMouseLeave)
          
           node.attr("cx", 
                    function (d){ 
                                
                                return thisContext.getAVal( d,true)
                            }
                        )
            .attr("cy", 
                    
                    function (d){
                                
                            return thisContext.getAVal( d,false)}
                )
        
          
          if( graphType == "ForceTree"  )
          {
                node.call(force.drag);
          }
            
          function updateNodesLinksText()
          {
              //console.log("tick " + dragging);
              
              if( ! animationOn && ( stopOnChild == true || dragging == true))
                {
                    var dataset = thisContext.getDisplayDataset();
                    
                    for( var x=0; x < dataset.nodes.length; x++)
                    {
                        if( ! dataset.nodes[x].userMoved )
                        {
                            dataset.nodes[x].x = dataset.nodes[x].parentDataNode.xMap[thisID]
                            dataset.nodes[x].y = dataset.nodes[x].parentDataNode.yMap[thisID]                           
                        }
                        
                        if( animationOn == false)
                            dataset.nodes[x].fixed = true;
                    }
                    
                  if( force && animationOn == false  && dragging == false)
                      force.stop();
                  
                  if( stopOnChild == true)
                      stopOnChild=false;

                }
                
             node.attr("cx", 
                    function (d){ 
                                
                                return thisContext.getAVal( d,true)
                            }
                        )
            .attr("cy", 
                    
                    function (d){
                                
                            return thisContext.getAVal( d,false)}
                )
        
          if ( anyLabels )
          { 
            if( graphType == "ForceTree" ) 
            {
                
            text.attr("transform", function(d) { return "translate(" + 
                        d.x
                            + "," + d.y+ ")"; });
            
            }
            else
            {
                /* radial labels: todo: this should be an option
>>>>>>> 09fee4649ee5405fb24f402ec6f4e327726e277c
                console.log("set rotate " + Math.PI *
                        d.listPosition / statics.getNodes().length);
                text.attr("transform", function(d) { return "rotate(" + Math.PI *
                        d.listPosition / statics.getNodes().length
                            + ")"});
                            */

                         text.attr("transform", function(d) {
                             return "translate(" +
                                 d.xMap[thisID] + "," + d.yMap[thisID] + ")";
                         });
                     }
                 }

                 //if a forcetree and hide links isn't checked, set link coordinates
                 if (graphType == "ForceTree" && !aDocument.getElementById("hideLinks").checked) {
                     link.attr("x1", function(d) {
                         return d.source.x;
                     })
                         .attr("y1", function(d) {
                             return d.source.y;
                         })
                         .attr("x2", function(d) {
                             return d.target.x;
                         })
                         .attr("y2", function(d) {
                             return d.target.y;
                         });
                 }

             }

             if (graphType != "ForceTree" && !aDocument.getElementById("hideLinks").checked && ((thisDocument.getElementById("scatterX").value == "circleX" ||
                     thisDocument.getElementById("scatterX").value == "circleY") &&
                 (thisDocument.getElementById("scatterY").value == "circleX" || thisDocument.getElementById("scatterY").value == "circleY"))) {
                 var depth = 0;

                 //Function to add node and its children to the vis (recursively)
                 function addNodeAndChildren(aNode) {
                     depth++;
                     if (!aNode.doNotShow && aNode.children && aNode.children.length > 0) {
                         for (var i = 0; i < aNode.children.length; i++) {
                             var childNode = aNode.children[i];

                             if (!childNode.doNotShow) {
                                 vis.append("line").attr("x1", aNode.xMap[thisID]).
                                 attr("y1", aNode.yMap[thisID]).
                                 attr("x2", childNode.xMap[thisID]).
                                 attr("y2", childNode.yMap[thisID]).
                                 attr("stroke-width", 0.5).
                                 attr("stroke", "black");

                                 addNodeAndChildren(childNode);
                             }
                         }
                     }
                     depth--;
                 }

                 //add node and children to the root
                 addNodeAndChildren(statics.getRoot());

             }
             //if the graph is not a force tree, remove all lines
             else if (graphType != "ForceTree") {
                 vis.selectAll("line").remove();
             }

             //if the graph is a force tree, update the node-link text on ticks of the force layout
             if (graphType == "ForceTree")
                 force.on("tick", updateNodesLinksText);

             //force.on("end", updateNodesLinksText);

             // Update the links            
             if (graphType == "ForceTree" && !aDocument.getElementById("hideLinks").checked) {
                 link = vis.selectAll("line.link")
                     .data(links.filter(this.myFilterLinks), function(d) {
                         return d.target.name;
                     });
             }


             //);

             // Enter any new links.
             //vis.remove("svg:line");
             //If the graph is a force tree and hide links isn't checked, enter any new links
             if (graphType == "ForceTree" && !aDocument.getElementById("hideLinks").checked)
                 link.enter().insert("svg:line", ".node")
                     .attr("class", "link")

             var table = aDocument.getElementById("tNodeTable"); //.rows[0].cells[1].item[0] = "" + numMarked ;

             table.rows[0].cells[1].innerHTML = "" + numVisible;

             var row = table.rows[1];
             var cell = row.cells[1];
             cell.innerHTML = "" + numMarked;

             for (var x = 0; x < nodes.length; x++) {
                 nodes[x].nodeLabelText = this.getLabelText(nodes[x]);
             }


             if (anyLabels) {

                 var text = vis.selectAll("text").data(filteredNodes).enter().append("svg:text")
                     .text(function(d) {
                         return d.parentDataNode.nodeLabelText;
                     })
                     .attr("font-family", "sans-serif")
                     .attr("font-size", aDocument.getElementById("fontAdjust").value + "px")
                     .attr("fill", function(d) {
                         return thisContext.getTextColor(d.parentDataNode)
                     });

                 if (graphType != "ForceTree") {
                     text.attr("x",
                         function(d) {
                             return thisContext.getAVal(d, true)
                         })
                         .attr("y",
                             function(d) {
                                 return thisContext.getAVal(d, false)
                             })

                     /* todo: radial labels should be an option
                        .attr("transform", 
                                function(d) 
                                { 
                                    var anAngle = 360.0 *  
                                    d.listPosition / (Math.PI *statics.getNodes().length);
                                    
                                    console.log( anAngle);
                                    
                                    return "rotate(" + anAngle + "," 
                                            + thisContext.getAVal( d,true)
                                                + "," + thisContext.getAVal( d,false) + ")"
                                 }
                             );
                             */
                 } else {
                     text.attr("dx", function(d) {
                         return 15;
                     })
                         .attr("dy", function(d) {
                             return ".35em";
                         })
                 }

             }

             if (graphType != "ForceTree") {
                 this.addAxis(thisDocument.getElementById("scatterX").value, true);
                 this.addAxis(thisDocument.getElementById("scatterY").value, false);
             }



             // cleanup
             if (graphType == "ForceTree" && !aDocument.getElementById("hideLinks").checked)
                 link.exit().remove();

             node.exit().remove();
         }

         // the color choosers don't work unless they are initialized first
         // hence they are initialized in the "section" and then moved to the appropriate menu
         // once everything else has settled in...
         if (firstUpdate && isRunFromTopWindow) {
             this.setQuantitativeDynamicRanges();
             //aDocument.getElementById("ColorSubMenu").appendChild(aDocument.getElementById("color1"));
             //aDocument.getElementById("color1").style.visibility="visible";

             //aDocument.getElementById("ColorSubMenu").appendChild(aDocument.getElementById("color2"));
             //aDocument.getElementById("color2").style.visibility="visible";
         }

         firstUpdate = false;
     }

     //Function to release everything that is "fixed"
     this.releaseAllFixed = function() {
         var displayNodes = this.getDisplayDataset().nodes;

         for (var x = 0; x < displayNodes.length; x++) {
             if (!displayNodes[x].userMoved) {
                 displayNodes[x].fixed = false;
                 displayNodes[x].x = displayNodes[x].parentDataNode.xMap[thisID];
                 displayNodes[x].y = displayNodes[x].parentDataNode.yMap[thisID];
             }
         }

         stopOnChild = true;
         animationOn = true;

         if (force)
             force.start();

         this.redrawScreen();
     }


     //Function to get the text color
     this.getTextColor = function(d) {
         if (aDocument.getElementById("textIsBlack").checked)
             return "#000000";

         var chosen = aDocument.getElementById("colorByWhat").value;

         if (statics.getColorScales()[chosen] != null || statics.getRanges()[chosen] != null)
             return this.color(d);

     }

     //Function for when the mouse enters
     this.myMouseEnter = function(d) {
         if (force && animationOn == false && dragging == false)
             force.stop();

         if (!aDocument.getElementById("mouseOverHighlights").checked)
             return;

         if (statics.getHighlightedNode()) {
             statics.getHighlightedNode().highlight = false;
         }

         d = d.parentDataNode

         statics.setHighlightedNode(d);
         d.highlight = true;
         lastSelected = d;

         infoPane = aDocument.getElementById("rightInfoArea")

         var someHTML = "<table>";

         for (prop in d) {
             if (prop != "forceTreeNodeID" && prop != "x" && prop != "y" && prop != "children" && prop != "fixed" && prop != "xMap" && prop != "yMap" && prop != "xMapNoise" && prop != "yMapNoise" && prop != "highlight" && prop != "nodeLabelText" &&
                 prop != "thisNodeRadius" && prop != "thisNodeColor" &&
                 prop != "marked" && prop != "doNotShow" && prop != "listPosition" && prop != "px" &&
                 prop != "py" && prop != "weight" && prop != "aParentNode") {
                 var aVal = "" + d[prop];

                 //todo: This will truncate long strings..
                 someHTML += ("<tr><td>" + prop + "</td><td> " + aVal.substring(0, 25) + "</td></tr>")
             }
         }

         someHTML += "</table>"

         infoPane.innerHTML = someHTML;

         dirty = true;
         thisContext.redrawScreen();
     }

     //Function for when the mouse leaves
     this.myMouseLeave = function() {
         if (force && animationOn == false && dragging == false)
             force.stop();

         if (!aDocument.getElementById("mouseOverHighlights").checked)
             return;

         if (statics.getHighlightedNode()) {
             statics.getHighlightedNode().highlight = false;
         }


         dirty = true;
         thisContext.redrawScreen();
     }

     //Function to set the initial positions of the force plot
     this.setInitialPositions = function() {
         if (animationOn == false)
             this.arrangeForcePlot(false);
     }

     //Function to arrange the nodess of the force plot
     this.arrangeForcePlot = function(arrangeChildren) {
         var topNode = statics.getRoot();

         if (arrangeChildren && lastSelected) {
             topNode = lastSelected;
         }

         var displayNodes = this.getDisplayDataset().nodes;

         for (var x = 0; x < displayNodes.length; x++) {
             displayNodes[x].fixed = false;

             if (arrangeChildren == false)
                 displayNodes[x].userMoved = false

             if (arrangeChildren && topNode == displayNodes[x].parentDataNode) {
                 displayNodes[x].fixed = true;
                 displayNodes[x].userMoved = true;
             }
         }

         numVisibleArray = [];
         numAssignedArray = [];

         for (var x = 0; x <= statics.getMaxLevel(); x++) {
             numVisibleArray.push(0);
             numAssignedArray.push(0);
         }

         var localMaxLevel = statics.getMaxLevel()

         if (topNode != statics.getRoot()) {
             localMaxLevel = 0;
         }

         var nodesToRun = nodes;

         if (arrangeChildren && lastSelected) {
             nodesToRun = [];

             function addNodeAndChildren(aNode) {
                 nodesToRun.push(aNode);
                 localMaxLevel = Math.max(aNode.nodeDepth, localMaxLevel);

                 if (aNode.children)
                     for (var x = 0; x < aNode.children.length; x++)
                         addNodeAndChildren(aNode.children[x]);
             }

             addNodeAndChildren(lastSelected);

         }

         for (var x = 0; x < nodesToRun.length; x++) {
             if (nodesToRun[x].doNotShow == false)
                 numVisibleArray[nodesToRun[x].nodeDepth] = numVisibleArray[nodesToRun[x].nodeDepth] + 1;
         }

         // if we are not arranging to a child node
         // the root is at the top of the tree in the center of the screen
         if (topNode == statics.getRoot()) {
             topNode.xMap[thisID] = w / 2.0 + 20.0;
             topNode.yMap[thisID] = h / 2.0;
         }

         var radius = parseFloat(Math.min(w, h)) / 2.0;

         radius = radius - radius * parseFloat(aDocument.getElementById("gravitySlider").value) / 100.0;

         var localMinLevel = 0.0;

         if (arrangeChildren && lastSelected) {
             radius = radius / aDocument.getElementById("localGravity").value;
             localMinLevel = topNode.nodeDepth;
         }

         localMinLevel = parseFloat(localMinLevel);

         var piTwice = 2.0 * Math.PI;

         var range = parseFloat(statics.getMaxLevel() - localMinLevel)
         for (var x = 0; x < nodesToRun.length; x++)
             if (nodesToRun[x].doNotShow == false) {
                 var aPosition = parseFloat(numAssignedArray[nodesToRun[x].nodeDepth]) / numVisibleArray[nodesToRun[x].nodeDepth];

                 var aRad = (parseFloat(nodesToRun[x].nodeDepth) - localMinLevel) / range * radius;
                 nodesToRun[x].xMap[thisID] = topNode.xMap[thisID] -
                     aRad * Math.cos(piTwice * aPosition);
                 nodesToRun[x].yMap[thisID] = aRad * Math.sin(piTwice * aPosition) + topNode.yMap[thisID];
                 numAssignedArray[nodesToRun[x].nodeDepth] = numAssignedArray[nodesToRun[x].nodeDepth] + 1;
             }

         animationOn = false;
         stopOnChild = true;

     }

     //Function to initialize everything
     this.initialize = function() {

         this.flatten();

         if (graphType != "ForceTree") {
             this.addIndividualMenuDynamicMenuContent();

         }

         initHasRun = true;
         dirty = true;
         this.update();

         this.toggleVisibilityOfSidebars();

         if (graphType == "ForceTree")
             this.arrangeForcePlot(false)

         this.redrawScreen();
     }

     //Function to get a quantitative color
     this.getQuantiativeColor = function(d) {
         var chosen = aDocument.getElementById("colorByWhat").value;

         var lowColor = "#" + aDocument.getElementById("quantColorLow").value;
         var highColor = "#" + aDocument.getElementById("quantColorHigh").value;

         var aRange = []
         aRange.push(aDocument.getElementById("lowQuantRange").value);
         aRange.push(aDocument.getElementById("highQuantRange").value);

         if (lowColor > highColor) {
             var temp = lowColor
             lowColor = highColor;
             highColor = temp;
         }

         if (aDocument.getElementById("logColor").checked) {
             aVal = d[chosen];
             maxScale = Math.log(aRange[1]) / Math.LN10;

             if (aVal == 0)
                 aVal = maxScale;
             else
                 aVal = Math.log(aVal) / Math.LN10;

             var aScale = d3.scale.linear().domain([0, maxScale]).range([lowColor, highColor]).clamp(true);
             return aScale(aVal);
         } else {
             var aScale = d3.scale.linear().domain(aRange).range([lowColor, highColor]).clamp(true);
             return aScale(d[chosen]);
         }

     }

     //Function to get a color
     this.color = function(d) {
         if (d.highlight == true)
             return "#fd8d3c"; // orange

         var chosen = aDocument.getElementById("colorByWhat").value;

         if (statics.getRanges()[chosen] != null)
             return this.getQuantiativeColor(d);

         if (statics.getColorScales()[chosen] != null)
             return statics.getColorScales()[chosen](d[chosen]);

         if (d._children != null)
             return "#3182bd"; // bright blue

         if (d.marked)
             return "#000000"; // black


         return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";

     }

     // Toggle children on click.
     this.myClick = function(d) {

         var aValue = aDocument.getElementById("clickDoesWhat").value;

         if (aValue == "deletes") {
             initHasRun = false;
             d.children = null;
             d._children = null;
             thisContext.initialize();
         }
         if (aValue == "collapses") {
             initHasRun = false;

             if (d._children == null) {
                 d._children = d.children;
                 d.children = null;
             } else {
                 d.children = d._children
                 d._children = null;
             }

             thisContext.initialize();
         } else if (aValue == "hides") {
             thisContext.hideAndShow(d);
         }

         dirty = true;
         thisContext.update();
     }

     //Function to hide and show nodes
     this.hideAndShow = function(d) {
         if (!d)
             d = statics.getHighlightedNode();

         if (!d)
             d = statics.getRoot();

         statics.setHighlightReverse(!statics.getHighlightReverse());

         if (statics.getHighlightReverse() == false) {
             this.showOnlyMarked(false);
         } else {
             for (var x = 0; x < nodes.length; x++)
                 nodes[x].doNotShow = true;

             thisContext.highlightAllChildren(d);
             thisContext.highlightAllParents(d);
         }
     }

     //Function to highlight all children
     this.highlightAllChildren = function(d) {
         if (d == null)
             return;

         d.doNotShow = false;

         if (!d.children || d.children == null)
             return;

         for (var x = 0; x < d.children.length; x++) {
             this.highlightAllChildren(d.children[x]);
         }
     }

     //Function to highlight all parents
     this.highlightAllParents = function(d) {
         if (d == null)
             return;

         d.doNotShow = false;
         if (!d.aParentNode || d.aParentNode != null) {
             thisContext.highlightAllParents(d.aParentNode);
         }
     }


     // Returns a list of all nodes under the root.
     this.flatten = function() {
         if (!isRunFromTopWindow) {
             nodes = statics.getNodes();
             this.setInitialPositions();
             this.addDynamicMenuContent();
             return;
         }

         var myNodes = [];
         var level = 0.0;

         function addNodeAndChildren(aNode) {
             level++;
             statics.setMaxLevel(Math.max(level, statics.getMaxLevel()));
             if (aNode != null) {
                 aNode.nodeDepth = level;
                 myNodes.push(aNode);

                 if (aNode.children != null)
                     for (var x = 0; x < aNode.children.length; x++) {
                         addNodeAndChildren(aNode.children[x])
                         aNode.children[x].aParentNode = aNode;
                     }

             }
             level--;
         }

         addNodeAndChildren(statics.getRoot());

         for (var i = 0; i < myNodes.length; i++) {
             if (!myNodes[i].forceTreeNodeID) myNodes[i].forceTreeNodeID = i + 1;

             myNodes[i].listPosition = i;
             myNodes[i].xMap = {};
             myNodes[i].yMap = {};
             myNodes[i].xMapNoise = {};
             myNodes[i].yMapNoise = {};
         }

         nodes = myNodes;
         statics.setNodes(nodes);

         this.setInitialPositions();
         this.addDynamicMenuContent();

     }

     this.reforce();

     if (isRunFromTopWindow) {
         //aDocument.getElementById("color1").style.visibility="hidden";
         //aDocument.getElementById("color2").style.visibility="hidden";
         //todo: nice error message if file can't be found
         d3.json(getQueryStrings(thisWindow)["FileToOpen"], function(json) {
             statics.setRoot(json);
             thisContext.initialize(); // wait until the data is loaded to initialize
         });
     } else {
         thisContext.initialize(); // data is already loaded - ok to initialize.
     }

 }