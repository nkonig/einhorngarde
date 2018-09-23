/*const editSeasonButton = document.getElementById('editSeason');*/

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
		console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.deleteeq-btn').on('click', function() {
		var target = '/treasury/eq/delete/' + this.value;
		console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.edituser-btn').on('click', function() {
		var origin = window.location.href;
		var target = '/users/edit/' + this.value;
		console.log('Called: ' + target);
		$( location ).attr("href", target);
	});

	$('.deleteuser-btn').on('click', function() {
		var target = '/users/delete/' + this.value;
		console.log('Called: ' + target);
		$( location ).attr("href", target);
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