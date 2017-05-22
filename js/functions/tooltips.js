/*/ ===== TOOLTIP FUNCTIONALITY ===== /*/
$('#auctionInformation').on('mouseenter', '.masterTooltip', function(){
        // when hovering over list items
        // take the title attribute of what you're moused over
        var title = $(this).attr('title');
        $(this).data('tipText', title).removeAttr('title');
        // create a node for your tooltip
        $('<p class="tooltip"></p>')
        	// set it's text to the attribute that you've stripped from your target
          .text(title)
          .appendTo('body')
          .fadeIn('slow');
});
$('#auctionInformation').on('mouseleave', '.masterTooltip', function() {
        // Hover out code
        // get rid of the tooltip node, and replace the original attribute text
        $(this).attr('title', $(this).data('tipText'));
        $('.tooltip').remove();
}).mousemove(function(e) {
        var mouseX = e.pageX + 20; //Get X coordinates
        var mouseY = e.pageY + 10; //Get Y coordinates
        $('.tooltip')
        .css({ top: mouseY, left: mouseX })
});
