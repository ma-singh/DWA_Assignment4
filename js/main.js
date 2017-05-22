$(document).ready(function(){

	// array of characters statistics
	var statsArray = [];

/*/ ========== FORM SUBMISSION AJAX CALL FUNCTIONS ========== /*/
	$("#form").submit(function(e){
		// prevent form from submitting and reloading page
		e.preventDefault();

		// for if&when the macro to parse auction house data breaks
		var OFFLINE_TESTING = false;

		// character name and realm
		var cName = $('#charName').val();
		var cRealm = $('#charRealm').val();

		console.log("form submitted");

		$("#loading-div").show();

		/* ajax call to load character data */
		$.ajax({

			type: 'GET',
			url: "https://us.api.battle.net/wow/character/" + cRealm + "/" + cName + "?fields=items,stats,talents&locale=en_US&jsonp=character&apikey=3kpvrz4edby68wq78br6ugyt54k6zdje",
			jsonpCallback: 'character',
			dataType: "jsonp",
			success: function(data) {

				console.log("AJAX call to character database");

				// push character strength, agility, and intellect to an array
				statsArray.push(data.stats.str);
				statsArray.push(data.stats.agi);
				statsArray.push(data.stats.int);

				// send character data to a function and display relevant stats
				displayCharacterStats(statsArray, data);

				// send character gear to a funciton and display information
				displayGear(data);

			},
			complete: function() {
				// when the character information is correctly handled, show the character information
				$('#characterInformation').show();
			},
			error: function() {
				// if something happens, stop spinning the loading image
				$('#loading-div').hide();
			}
		});
		$.ajax({

			type: 'GET',
			url: "https://us.api.battle.net/wow/auction/data/" + cRealm + "?locale=en_US&jsonp=auction&apikey=3kpvrz4edby68wq78br6ugyt54k6zdje",
			jsonpCallback: "auction",
			dataType: "jsonp",
			success: function(data) {

				var auctionUrl = data.files[0].url;
				// FOR LOCAL TESTING USE ONLY!
				if(OFFLINE_TESTING){
					auctionUrl = "js/dummyData.json";
				}

				$.ajax({
					type: 'GET',
					crossOrigin: !OFFLINE_TESTING,
					url: auctionUrl,
					success: function(data) {

						console.log("AJAX call to auction house API");
						if(!OFFLINE_TESTING){
							var auctionData = $.parseJSON(data);
						}else{
							var auctionData = data;
						}
						// set the heading to display what realm's auction house is being reviewed
						$('#auctionInfo-div-heading').html('Average Auction House Prices | <span>' + auctionData.realms[0].name + '</span');

						// clear list of enchant prices so it won't continue adding prices upon loading a new character
						clearAuctionInformation();
						// check auction house prices for gear slots and add average price to list
						getNeckEnchants(auctionData);
						getCloakEnchants(auctionData);
						getRingEnchants(auctionData);

					},
					complete: function() {
						$('#loading-div').hide();
						$('#auctionInformation').show();
					}
				});
			}
		});
	});
});
