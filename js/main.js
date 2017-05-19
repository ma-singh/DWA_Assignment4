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

/*/ ========== HELPER FUNCTIONS ========== /*/

	function displayItemStats(itemStatsArray) {
		var newHTML = [];
		for (var i = 0; i < itemStatsArray.length; i++) {
			newHTML.push('<p class="itemStats">' + itemStatsArray[i] + '</p>');
		}
		return newHTML;
	}

	function displayCharacterStats(statsArray, data) {
		/* character name */
		$("#name").text(data.name);
		$("#spec").text(getCharacterSpecialization(data.talents) + " " + getCharacterClass(data.class));
		$("#spec").css("color", getClassColor(data.class));

		// character icon
		var characterIcon = data.thumbnail;
		var cImg = $('#cIcon');
		cImg.attr('src', "http://render-us.worldofwarcraft.com/character/" + characterIcon + "");

		characterIcon = characterIcon.slice(0,20);
		console.log(characterIcon);
		$('#cProfile').attr('src', "http://render-us.worldofwarcraft.com/character/" + characterIcon + "-profilemain.jpg");

		// character stats
		$("#primary").text("Primary Statistic: " + getPrimaryStat(statsArray));
		$("#crit").text("Critical Strike: " + roundCharacterStatistic(data.stats.crit) + "%");
		$("#haste").text("Haste: " + roundCharacterStatistic(data.stats.hasteRatingPercent) + "%");
		$("#mastery").text("Mastery: " + roundCharacterStatistic(data.stats.mastery) + "%");
		$("#vers").text("Versatility: " + roundCharacterStatistic(data.stats.versatility));
	}

	function displayGear(data) {
		/* ENCHANTABLE ITEMS */
		$("#neck").html("<img src='http://media.blizzard.com/wow/icons/56/" + data.items.neck.icon + ".jpg' /><p class='title'>" + data.items.neck.name + "</p><p class='iLvl'> Item Level: " + data.items.neck.itemLevel + "</p>" + displayItemStats(getItemStats(data.items.neck.stats)).join(""));
		$("#cloak").html("<img src='http://media.blizzard.com/wow/icons/56/" + data.items.back.icon + ".jpg' /><p class='title'>" + data.items.back.name + "</p><p class='iLvl'> Item Level: " + data.items.back.itemLevel + "</p>" + displayItemStats(getItemStats(data.items.back.stats)).join(""));
		$("#ring1").html("<img src='http://media.blizzard.com/wow/icons/56/" + data.items.finger1.icon + ".jpg' /><p class='title'>" + data.items.finger1.name + "</p><p class='iLvl'> Item Level: " + data.items.finger1.itemLevel + "</p>" + displayItemStats(getItemStats(data.items.finger1.stats)).join(""));
		$("#ring2").html("<img src='http://media.blizzard.com/wow/icons/56/" + data.items.finger2.icon + ".jpg' /><p class='title'>" + data.items.finger2.name + "</p><p class='iLvl'> Item Level: " + data.items.finger2.itemLevel + "</p>" + displayItemStats(getItemStats(data.items.finger2.stats)).join(""));
	}

	function truncateNumber(num) {
		// take the integer and turn it into a string
		var replacement = num.toString();
		// remove that last 4 places of the string (trailing zeroes)
		replacement = replacement.slice(0, -4);
		// parse the string to return it to an integer (so it can be used to get an average)
		replacement = Number.parseInt(replacement, 10);

		return replacement;
	}


	function roundCharacterStatistic(num) {
		var roundedStat = Math.round(num * 10) / 10;

		return roundedStat;
	}

	function getAveragePrice(numbersArray) {
		var total = 0;
		// loop through array containing buyout prices for an item and add it to the total
		for (var i = 0; i < numbersArray.length; i++) {
			total += numbersArray[i];
		}
		// divide the total by the number of items in the array to get an average
		total = total / numbersArray.length;
		// round the number to a whole integer
		total = Math.round(total);
		return total;
	}

	function getPrimaryStat(statistics) {
		// get the highest value from a character's intellect, strength, and agility
		var pStat = Math.max(...statistics);

		return pStat;
	}

	function getItemStats(itemArray) {
		var stats = [];

		// loop through character's item statistics and add matching stat to an array
		for (var i = 0; i < itemArray.length; i++) {
			if (itemArray[i].stat == 3) {
				stats.push("+" + itemArray[i].amount + " Agility");
			}
			if (itemArray[i].stat == 4) {
				stats.push("+" + itemArray[i].amount + " Strength");
			}
			if (itemArray[i].stat == 5) {
				stats.push("+" + itemArray[i].amount + " Intellect");
			}
			if (itemArray[i].stat == 32) {
				stats.push("+" + itemArray[i].amount + " Critical Strike");
			}
			if (itemArray[i].stat == 36) {
				stats.push("+" + itemArray[i].amount + " Haste");
			}
			if (itemArray[i].stat == 40) {
				stats.push("+" + itemArray[i].amount + " Versatility");
			}stats.push()
			if (itemArray[i].stat == 49) {
				stats.push("+" + itemArray[i].amount + " Mastery");
			}
			if (itemArray[i].stat == 62) {
				stats.push("Leech");
			}
			if (itemArray[i].stat == 64) {
				stats.push("Indestructible");
			}
			if (itemArray[i].stat == 71) {
				stats.push("+" + itemArray[i].amount + " Strength/Intellect/Agility");
			}
			if (itemArray[i].stat == 72) {
				stats.push("+" + itemArray[i].amount + " Strength/Agility");
			}
			if (itemArray[i].stat == 73) {
				stats.push("+" + itemArray[i].amount + " Agility/Intellect");
			}
			if (itemArray[i].stat == 74) {
				stats.push("+" + itemArray[i].amount + " Strength/Intellect");
			}
		}
		return stats;
	}

	function getCharacterSpecialization(characterTalents) {
		var spec = "";
		// loop through array of talent trees
		for (var i = 0; i < characterTalents.length; i++) {
			// if talent tree is selected, get name of selected spec tree
			if(characterTalents[i].selected == true) {
				spec = characterTalents[i].spec.name;
			}
		}
		return spec;
	}

	function getCharacterClass(classId) {
		var className = "";
		if (classId == 1) {
			className = "Warrior";
		}
		if (classId == 2) {
			className = "Paladin";
		}
		if (classId == 3) {
			className = "Hunter";
		}
		if (classId == 4) {
			className = "Rogue";
		}
		if (classId == 5) {
			className = "Priest";
		}
		if (classId == 6) {
			className = "Death Knight";
		}
		if (classId == 7) {
			className = "Shaman";
		}
		if (classId == 8) {
			className = "Mage";
		}
		if (classId == 9) {
			className = "Warlock";
		}
		if (classId == 10) {
			className = "Monk";
		}
		if (classId == 11) {
			className = "Druid";
		}
		if (classId == 12) {
			className = "Demon Hunter";
		}

		return className;
	}

	function getClassColor(classId) {
		var classColor = "";

		if (classId == 1) {
			classColor = "#C79C6E";
		}
		if (classId == 2) {
			classColor = "#F58CBA";
		}
		if (classId == 3) {
			classColor = "#ABD473";
		}
		if (classId == 4) {
			classColor = "#FFF569";
		}
		if (classId == 5) {
			classColor = "#FFFFFF";
		}
		if (classId == 6) {
			classColor = "#C41F3B";
		}
		if (classId == 7) {
			classColor = "#0070DE";
		}
		if (classId == 8) {
			classColor = "#69CCF0";
		}
		if (classId == 9) {
			classColor = "#9482C9";
		}
		if (classId == 10) {
			classColor = "#00FF96";
		}
		if (classId == 11) {
			classColor = "#FF7D0A";
		}
		if (classId == 12) {
			classColor = "#A330C9";
		}

		return classColor;

	}

	function searchAuctionHouse(auctionData, enchantId) {
		// array of items searched for from the auction house API
		var auctionItems = [];

		for (var i = 0; i < auctionData.auctions.length; i++) {
			if (auctionData.auctions[i].item == enchantId) {
				// get buyout price of auction item
				var buyoutPrice = auctionData.auctions[i].buyout;
				// truncate number to remove excess zeroes from price (silvers and coppers)
				buyoutPrice = truncateNumber(buyoutPrice);

				// push price to an array
				auctionItems.push(buyoutPrice);
			}
		}

		return auctionItems;
	}

	function getNeckEnchants(auctionData) {
		// search auction house for neck enchants and buyout price
		var auctionItems = searchAuctionHouse(auctionData, 141909);
		$('#neckEnchants').append('<li class="masterTooltip" title="Enchant a necklace to increase Mastery by 600">Mark of the Trained Soldier: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
		auctionItems = searchAuctionHouse(auctionData, 141910);
		$('#neckEnchants').append('<li class="masterTooltip" title="Enchant a necklace to sometimes heal a nearby ally for 400% of your spell power">Mark of the Ancient Priestess: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
		auctionItems = searchAuctionHouse(auctionData, 128551);
		$('#neckEnchants').append('<li class="masterTooltip" title="Enchant a necklace to sometimes increase Critical Strike and Haste by 1000 for 6 seconds">Mark of the Claw: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
		auctionItems = searchAuctionHouse(auctionData, 128553);
		$('#neckEnchants').append('<li class="masterTooltip" title="Enchant a necklace to sometimes summon a Satyr that will fire a bolt of nightmare energy at your enemy, dealing damage">Mark of the Hidden Satyr: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
	}

	function getCloakEnchants(auctionData) {
		// search auction house for cloak enchants and buyout price
		var auctionItems = searchAuctionHouse(auctionData, 128549);
		$('#cloakEnchants').append('<li class="masterTooltip" title="Enchant a cloak to increase Agility by 200">Binding of Agility: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
		auctionItems = searchAuctionHouse(auctionData, 128550);
		$('#cloakEnchants').append('<li class="masterTooltip" title="Enchant a cloak to increase Intellect by 200">Binding of Intellect: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
		auctionItems = searchAuctionHouse(auctionData, 128548);
		$('#cloakEnchants').append('<li class="masterTooltip" title="Enchant a cloak to increase Strength by 200">Binding of Strength: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
	}

	function getRingEnchants(auctionData) {
		// search auction house for ring enchants and buyout price
		var auctionItems = searchAuctionHouse(auctionData, 128541);
		$('#ringEnchants').append('<li class="masterTooltip" title="Enchant a ring to increase Critical Strike by 200">Binding of Critical Strike: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');					
		auctionItems = searchAuctionHouse(auctionData, 128542);
		$('#ringEnchants').append('<li class="masterTooltip" title="Enchant a ring to increase Haste by 200">Binding of Haste: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
		auctionItems = searchAuctionHouse(auctionData, 128543);
		$('#ringEnchants').append('<li class="masterTooltip" title="Enchant a ring to increase Mastery by 200">Binding of Mastery: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
		auctionItems = searchAuctionHouse(auctionData, 128544);
		$('#ringEnchants').append('<li class="masterTooltip" title="Enchant a ring to increase Versatility by 200">Binding of Versatility: <span class="gold">' + getAveragePrice(auctionItems) + 'g</span></li>');
	}

	function clearAuctionInformation() {
		// remove list items from lists for reloading/loading new character
		// this preserves headings
		$('#neckEnchants li').remove();
		$('#cloakEnchants li').remove();
		$('#ringEnchants li').remove();
	}

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
});