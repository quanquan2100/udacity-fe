
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    var streetStr = $('#street').val();
    var cityStr = $('#city').val();
    var address = streetStr + ', ' + cityStr;

    $greeting.text('So, you want to live at ' + address + '?');


    // load streetview
    var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
    $body.append('<img class="bgimg" src="' + streetviewUrl + '">');

    // YOUR CODE GOES HERE!
    var nytimesKey = "993d4f8bcdce4356a26d65675ae3c845";
    var url = "http://api.nytimes.com/svc/search/v2/articlesearch.json?fq=romney&sort=newest&facet_field=day_of_week&begin_date=20120101&end_date=20120101&api-key=" + nytimesKey;
    $.getJSON(url, function(data) {
        console.log(data);
    });

    return false;
};

$('#form-container').submit(loadData);
// AIzaSyAcKuNWvchfVg45w8ZLy8HXE7eieDOI-uE