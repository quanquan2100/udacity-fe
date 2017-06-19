
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
    var streerStr = $("#street").val();
    var cityStr = $("#city").val();
    $("body").append('<img class="bgimg" src="http://maps.googleapis.com/maps/api/streetview?size=600x300&location=' + streerStr+ "," + cityStr + '">');

    // YOUR CODE GOES HERE!
    var nytimesKey = "AIzaSyAcKuNWvchfVg45w8ZLy8HXE7eieDOI-uE";
    var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=romney&sort=newest&facet_field=day_of_week&begin_date=20120101&end_date=20120101&api-key=" + nytimesKey;
    $.getJSON(url, function(data) {
        console.log(data);
    });

    return false;
};

$('#form-container').submit(loadData);
// AIzaSyAcKuNWvchfVg45w8ZLy8HXE7eieDOI-uE