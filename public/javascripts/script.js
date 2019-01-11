/*const editSeasonButton = document.getElementById('editSeason');*/
/* mdb bootstrap
 $(document).ready(function() {
	$('.mdb-select').materialSelect();
  });
*/
$(document).ready(function() {

	$(".nav li.disabled a").click(function() {
		return false;
	});

	$('.editseason-btn').on('click', function() {
		var target = '/treasury/season/' + this.value + '/edit';
		/*$.get(target, function(data) {
			console.log('Called: ' + target);
		});*/
		$( location ).attr("href", target);
	});

	$('.editeq-btn').on('click', function() {
		var origin = window.location.href;
		var target = origin + '/' + this.value;
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.deleteeq-btn').on('click', function() {
		var target = '/treasury/eq/delete/' + this.value;
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.edituser-btn').on('click', function() {
		var origin = window.location.href;
		var target = '/users/edit/' + this.value;
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.addckparticipation-btn').on('click', function() {
		//var origin = window.location.href;
		var target = '/warroom';
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.addclan-btn').on('click', function() {
		var target = '/treasury/addclan';
		console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.editallglory-btn').on('click', function() {
		var target = '/users/editallglory/';
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.deleteuser-btn').on('click', function() {
		var target = '/users/delete/' + this.value;
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.resetpasswortuser-btn').on('click', function() {
		var target = '/users/resetpasswort/' + this.value;
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.distributseason-btn').on('click', function() {
		var target = '/treasury/season/' + this.value + '/distribute';
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.selectclan-btn').on('click', function() {
		var target = '/treasury';
		var clan_id = document.getElementById("clan_sel").value;
		if(clan_id) {
			target = '/treasury/' + clan_id;
		}
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.filterclan-btn').on('click', function() {
		var target = '/users';
		var clan_id = document.getElementById("clan_filter").value;
		if(clan_id) {
			target = '/users/clan=' + clan_id;
		}
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.filterts-btn').on('click', function() {
		var target = '/users';
		//console.log('Value: ' + this.value);
		if(this.value.toString() != 'all') {
			target = '/users/throneroom=' + this.value;
			var clanfilter = document.getElementById('clan_filter').value;
			var origin = window.location.href;
			if(clanfilter && origin.includes('clan=')) {
				target = target + '$$clan=' + clanfilter;
			}
		}
		//console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.filterselection-btn').on('click', function() {
		//console.log('Value: ' + this.value);
		var target = '/selection/' + this.value;
		console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.filterusername-btn').on('click', function() {
		var target = '/users';
		var searchinput = document.getElementById("usernamesearchinput").value;
		if(searchinput) {
			target = '/users/username=' + searchinput;
		}
		var clanfilter = document.getElementById('clan_filter').value;
		var origin = window.location.href;
		if(clanfilter && origin.includes('clan=')) {
			target = target + '$$clan=' + clanfilter;
		}
		$( location ).attr("href", target);
	});
	
	$('.usernamesearchinput').keypress(function (e) {
		if (e.which == 13) {
			$('.filterusername-btn').submit();
			//console.log('Submitt: Usernamesearch');
			return false;    //<---- Add this line
		}
	});

	$('.searchable').multiSelect({
		selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='try \"12\"'>",
		selectionHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='try \"4\"'>",
		afterInit: function(ms){
		  var that = this,
			  $selectableSearch = that.$selectableUl.prev(),
			  $selectionSearch = that.$selectionUl.prev(),
			  selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
			  selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';
	  
		  that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
		  .on('keydown', function(e){
			if (e.which === 40){
			  that.$selectableUl.focus();
			  return false;
			}
		  });
	  
		  that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
		  .on('keydown', function(e){
			if (e.which == 40){
			  that.$selectionUl.focus();
			  return false;
			}
		  });
		},
		afterSelect: function(){
		  this.qs1.cache();
		  this.qs2.cache();
		},
		afterDeselect: function(){
		  this.qs1.cache();
		  this.qs2.cache();
		}
	  });

	/*
	editSeasonButton.addEventListener('click', function(e) {
		console.log('button was clicked');
	  
		fetch('/treasury/editseason', {method: 'POST'})
		  .then(function(response) {
			if(response.ok) {
			  console.log('Click was recorded');
			  return;
			}
			throw new Error('Request failed.');
		  })
		  .catch(function(error) {
			console.log(error);
		  });
	  });
	
	$('a[href="#navbar-more-show"], .navbar-more-overlay').on('click', function(event) {
		event.preventDefault();
		$('body').toggleClass('navbar-more-show');
		if ($('body').hasClass('navbar-more-show'))	{
			$('a[href="#navbar-more-show"]').closest('li').addClass('active');
		}else{
			$('a[href="#navbar-more-show"]').closest('li').removeClass('active');
		}
		return false;
	});*/
});

function changeClanForStats() {
	var clanid = document.getElementById("clan_sel").value;
	var target = "/warroom/" + clanid;
	$( location ).attr("href", target);
}