(function(){tinymce.create("tinymce.plugins.LinkAutoDetect",{init:function(a,b){var c=this;c.RE_email=/^[a-z0-9_\-]+(\.[_a-z0-9\-]+)*@([_a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)$/i;c.RE_url=/^((https?|ftp|news):\/\/)?([a-z]([a-z0-9\-]*\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-z][a-z0-9_]*)?$/i;a.onKeyPress.add(c.onKeyPress,c);a.onKeyUp.add(c.onKeyUp,c)},getInfo:function(){return{longname:"Link Auto Detect",author:"Ubernote/Shane Tomlinson",authorurl:"http://www.ubernote.com",infourl:"http://www.ubernote.com",version:"0.2"}},onKeyPress:function(e,g,b){if(tinymce.isIE){return}var j=e.selection.getSel();var c=j.anchorNode;var d=function(r,n,k){var p=c;var l=p.splitText(j.anchorOffset);var q=p.splitText(k);var m=q.data.search(r);if(m!=-1){l=q.splitText(m)}var s=e.dom.create("a",{href:n},q.data);var o=q.parentNode.insertBefore(s,l);j.collapse(l,0);e.dom.remove(q)};if((g.which==13||g.which==32)&&c.nodeType==3&&c.data.length>3&&c.data.indexOf(".")>=0&&!e.dom.getParent(c,"a")){var a=c.data.substring(0,j.anchorOffset).search(/\S{4,}$/);if(a!=-1){var h=c.data.substring(0,j.anchorOffset).replace(/^.*?(\S*)$/,"$1");var f=h.match(this.RE_url);var i=h.match(this.RE_email);if(i){d(/[^a-zA-Z0-9\.@_\-]/,"mailto:"+i[0],a)}else{if(f){d(/[^a-zA-Z0-9\._\-\/\&\?#=:@]/,(f[1]?"":"http://")+f[0],a)}}}}},onKeyUp:function(d,g,i){if(tinymce.isIE){return}var e=d.selection.getSel();var h=e.anchorNode;var c=d.dom.getParent(h,"a");if(!(g.which&&(g.which==13||g.which==32))&&(g.which||g.keyCode==8||g.keyCode==46)&&(h.nodeType==3)&&(c)){var b=e.anchorNode.data.match(this.RE_email);var f=h.data.match(this.RE_url);if(b){d.dom.setAttrib(c,"href","mailto:"+h.data)}if(f){d.dom.setAttrib(c,"href",(f[1]?"":"http://")+f[0])}}}});tinymce.PluginManager.add("linkautodetect",tinymce.plugins.LinkAutoDetect)})();