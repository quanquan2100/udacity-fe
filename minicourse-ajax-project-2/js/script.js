
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview
    $("body").append('<img class="bgimg" src="http://maps.googleapis.com/maps/api/streetview?size=600x300&location=' + $("#street").val() + "," + $("#city").val() + '">')

    // YOUR CODE GOES HERE!

    return false;
};

$('#form-container').submit(loadData);
// AIzaSyAcKuNWvchfVg45w8ZLy8HXE7eieDOI-uE