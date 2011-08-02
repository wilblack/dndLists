/* dndLists.js
Written by Wil Black 04.04.2011
wilblack21@gmail.com

A javascript class that creates movable <UL> DOM Elements whose <LI>
can be dragged and dropped into one another. Styling is done with jQueryUI 1.8.11 
which can be gotten here http://jqueryui.com

Copyright (c) 2011, Wil Black
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL WIL BLACK BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


Usage:
  --- Create new list ---
  To create a new list name newList  
  
  myList = new List();
  myList.create("domID");
  
  A <UL> will be create with id='domID'. A ui-widget will also be create
  with id='domID-widget'. So if your lists have unique ids then your widgets 
  will to. 
  
  --- Set sink ---
  myList.sinkFor(listObj);
  
  This will set myList as a droppable element for <LI>'s from listObj (an instance of List).
  <LI>'s will be removed from their source when successfully dropped.
  
  --- Set source ---
  myList.source();
  
  Sets the <LI>'s of myList to draggable. 
  
  --- Other methods ---
  myList.add_word()
  myList.populate()
  myList.clear()
  
*/
//$(document).ready(function(){
(function( $ ){
	
	var placeholderTxt="<li class='placeholder'>&nbsp</li>";
	// Do your awesome plugin stuff here
	var methods = {
	  init: function(){
		this.wrap("<div class='ui-widget'>").wrap("<div class='ui-widget-content ui-corner-bottom'>");
	    this.closest(".ui-widget").prepend("<div class='ui-widget-header'>Header</div>")  
	    
	    
	    html = this.closest(".ui-widget").find(":header").text();
	    this.closest(".ui-widget").find(":header").detach();
	    if (!html) html += "Header";
	    
	    html+="<span class='sortBtn right fauxLink' ><h6>Sort</h6></span>";
	    this.closest(".ui-widget").find(".ui-widget-header").html(html).find("h6").attr("style","margin:0; float:right;");;
	    this.closest(".ui-widget").find(".sortBtn").bind("click",function(){$(this).closest(".ui-widget").find("ul").dndList('sort');})
	    
	    this.closest(".ui-widget").attr("style","width:200px")
		this.closest(".ui-widget-content").attr("style","overflow:auto;");
		this.dndList('source');	
		
		this.find("li").hover(
			function (){
				$(this).addClass("ui-state-hover");
			},
			function (){
				$(this).removeClass("ui-state-hover");
			}
	  	);
		
		this.data('dndList',{
			source:true,
			sinks:[],
			sortBtn:true
		});
	
		},
	  addWordOLD : function(word){
		/* DEPRECATED by Wil Black 8/2/2011 - USE ADD ITEM INSTEAD
		 * This is used to add a single word to a list as text. If more then
		 * text needs to be added use addItem.
		 */	
		this.find(".placeholder").remove();
		this.append("<li>"+word+"</li>");
		},
	  
	  addItem : function(item){
		/* Takes in an object or a string and populates the list
		 * INPUTS:
		 *  item [STRING] 
		 *  item [OBJECT]
		 * 		  
		 * If item is a an objects
		 * Keys:
		 * 	 text - REQUIRED Will be put in the visible part of the list <li>text</li>
		 *   id - becomes the LI's id attribute
		 *   value - becomes the LI's value attribute
		 *   name - becomes the LI's name attribute
		 * 
		 */			
		this.find(".placeholder").remove(); //Remove placeholder text if present
		this.append("<li></li>");
		var li = this.find("li:last");
		if (typeof(item)=='object'){
			if (item.text==undefined) return false;
			$(li).text(item.text);
			if (item.id) $(li).attr("id",item.id);
			if (item.value) $(li).val(item.value);
			if (item.name) $(li).attr("name",item.name);
		} else if (typeof(item)=='string') {
			this.find(".placeholder").remove();
			this.append("<li>"+item+"</li>");
		}
	  },
	  
		
	  multiselect : function(choices, selected){
			// Create the choices list and populate it
			this.dndList();
			this.addClass("dnd-choices");
			this.dndList("populate",choices);
						
			this.closest(".ui-widget").wrap("<div class='dnd-multiselect'>")
			this.closest(".dnd-multiselect").append("<ul class='dnd-selected'>");
			selectedList = this.closest(".dnd-multiselect").find(".dnd-selected");
			selectedList.dndList();
			if (selected) {
				selectedList.dndList("populate",selected);
			}else{
				selectedList.append(placeholderTxt);
			}
			
			// Set sinks for both lists
			selectedList.dndList("sinkFor",".dnd-choices li");
			this.dndList("sinkFor",".dnd-selected li");
			
			// Set the headers
			if (this.closest(".ui-widget").find(".ui-widget-header").text() == "Header") {				
			  this.closest(".ui-widget").find(".ui-widget-header").text("Available");
			}
			selectedList.closest(".ui-widget").find(".ui-widget-header").text("Selected");
		},
		
	  selected : function (format){
			/* This is called in the mulitselect list. Returns all selected values
			 * 
			 */
			selectedList = this.closest(".dnd-multiselect").find(".dnd-selected");
			if (format=='array') return selectedList.dndList("toArray");
			if (format=='json') return selectedList.dndList("toJSON");
			if (format=='url') return selectedList.dndList("toURL");
		},	
	  source: function(){
			this.find("li").draggable({
				appendTo:"body",
				helper:"clone",
			});
			this.data("dndList",{"source":true});
		},
	  sinkFor: function(source){
			// source is a selector string
				
			var obj=this;
			this.closest(".ui-widget").droppable({
				accept:source,
				drop: function( event, ui ) {
					$( this ).find( ".placeholder" ).remove();
					$( "<li class='ui-draggable'></li>" ).text( ui.draggable.text() ).appendTo( $(this).find("ul") );
					$(ui.draggable).remove();
					if (obj.data('dndList').source){obj.dndList('source');}
				}
			});
		},
		toArray: function(){
			/* Returns the list item text as an array of strings. Ignores all attributes.
			 * If you need access to attributes use toJSON
			 */
			var ls = this.find("li");
			var rs = [];
			for (i=0;i<ls.length;i++){
				rs.push(ls[i].textContent);
			}
			return rs;
		},	
		
		toJSON: function(){
			/* Returns the list item as a JSON object 
			 * Object will have the following keys if atributes are present
			 *   text
			 *   id
			 *   value
			 *   name
			 */
			var rs = [];
			var items = this.find("li");
			for (i=0; i<items.length;i++){
				var row={};
				if ($(items).eq(i).text() ) row.text=$(items).eq(i).text();
				if ($(items).eq(i).attr("id")) row.id=$(items).eq(i).attr("id");
				if ($(items).eq(i).attr("value") ) row.value = $(items).eq(i).attr("value");
				if ($(items).eq(i).attr("name")) row.name = $(items).eq(i).attr("name");
				rs.push(row);
			}
			return rs;
		},
		
		toURL: function(attribute){
			/* Returns a URI encoded string containg the values of the list seperated by a '|'.
			 * An attribute can be given:
			 *   id
			 *   value
			 *   name
			 * If no attribute is given the lists text is used.
			 * 
			 */
			var rs='';
			var items=this.find("li");
			for (i=0; i<items.length;i++){
				if (arguments.length==0){
					rs+=$(items).eq(i).text()+"|";
				}else{
					rs+=$(items).eq(i).attr(attribute)+"|";
				}
					
			}
			rs=rs.slice(0,-1);
			return encodeURI(rs);
		},
		
		populate: function(items){
			for (var i=0;i<items.length;i++){
				this.dndList("addItem",items[i]);	
			}
			this.dndList("source");
		},
		sort: function(){
			console.log("Entered sort")
			var ls = this.dndList('toArray');
			ls.sort();
			this.html("");
			this.dndList('populate',ls);
			return this;
		}
		
	};
  
	$.fn.dndList = function(method) {
		if(methods[method]){
		  return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
	      return methods.init.apply( this, arguments );
	    } else {
	      $.error( 'Method ' +  method + ' does not exist on jQuery.dndList' );
	    }    
		
	} //End dndList() function 
})( jQuery );
//});

/*

List = function (){
	this.div=$("#example");
	this.list;      
	this.sinks=[];   //Needs to go to plugin
	this.id="";
	this.clearBtn = false;  // needs to go to plugin
	this.sortBtn=true;     // needs to go to plugin
	this.width="200px";
	this.height="350px";
	this.source=true;     //Needs to go to plug
	this.placeholderTxt="<li class='placeholder'>&nbsp</li>";
};

List.prototype.create = function(id){
	this.id = id;
	this.div.append("<div id="+id+'-widget'+" class='ui-widget'>");
	this.widget = $("#"+id+'-widget');
	this.widget.append("<div class='ui-widget-header ui-corner-top'>");
	
	var html = id; 
	if (this.clearBtn){
		html+="<span class='clearBtn right fauxLink'><h6>Clear</h6></span>";
	}
	if (this.sortBtn){
		html+="<span class='sortBtn right fauxLink'><h6>Sort</h6></span>";
		
	}
	this.widget.find(".ui-widget-header").html(html);
	if(this.clearBtn){this.widget.find("span.clearBtn").bind('click',this.clear);}
	
	if(this.sortBtn){this.widget.find("span").bind('click',this.sort);}
	
	this.widget.append("<div class='ui-widget-content ui-corner-bottom'>");
	this.widget.find(".ui-widget-content").append("<ul id="+id+">");
	this.list = this.widget.find("ul");
	this.list = $("#"+id);
	this.list.append(this.placeholderTxt);
	
	this.widget.attr("style","width:"+this.width)
	this.widget.find(".ui-widget-content").attr("style","height:"+this.height+"; overflow:auto;");
	
	this.div.find("h6").attr("style","margin:0");
	
};

List.prototype.set_source = function(){
	this.source=true;
	this.list.find("li").draggable({
		appendTo:"body",
		helper:"clone",
	});
};


List.prototype.sinkFor = function(listObj){
	// listObj should be an instance of List
	this.sinks.push(listObj);
	var source = '';
	for (i in this.sinks){
		source+="#"+this.sinks[i].id+" li"+"," ;
	}
	source=source.slice(0,-1);
	var obj=this;	
	this.list.droppable({
		accept:source,
		drop: function( event, ui ) {
			$( this ).find( ".placeholder" ).remove();
			$( "<li class='ui-draggable'></li>" ).text( ui.draggable.text() ).appendTo( this );
			var originList = $(ui.draggable).closest("ul").find("li");
			if (originList.length==1){
				$(ui.draggable).closest("ul").append(obj.placeholderTxt);
			}
			$(ui.draggable).remove();
			if (obj.source){obj.set_source();}
		}
	});
};

List.prototype.moveable = function(){
	this.widget.draggable();
};

List.prototype.toForm = function(form) {
	// If a form is passed in this function will append the contents of its list to the given
	// form as a hidden input
	// If no arguments are passed in it will return the form contents as a pipe separated string. 
	var args = this.toForm.arguments;
	var ls = this.list.find("li");
	var rs = "";
	for (i=0;i<ls.length;i++){
		rs+=ls[i].textContent+"|";
	}
	if (args.length==1)	{
		var hidden = form.find("[name="+this.id+"]");
		if (hidden.length==0){form.append("<input type='hidden' name="+this.id+">");}
		form.find("[name="+this.id+"]").val(rs);
	} else {
		return rs;
	}	
	
};
*/