var express = require('express');
var url = require('url');
var http = require('http');
var request = require('request');
const cheerio = require('cheerio');
var S = require('string');
var app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('views', __dirname + '/views/');
app.set('view engine', 'jade');
app.use(express.static('public'))

app.get('/validate', function (req, res) {
    var parseData = [];

    request({ 'url': req.query.url }, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            console.log("page found and processed")

            var pageUrl = url.parse(req.query.url, true);
            var domainName = pageUrl.protocol + '//' + pageUrl.host;
            console.log("domainName:", domainName)

            const $ = cheerio.load(body, { normalizeWhitespace: true });

            var metaDescription;
            var metaKeyword;

            $('meta').each(function (i, item) {
                if ($(this).attr('name') === "description" || $(this).attr('name') === "Description") {
                    metaDescription = $(this).attr('content');
                }

                if ($(this).attr('name') === "keywords" || $(this).attr('name') === "Keywords") {
                    metaKeyword = $(this).attr('content');
                }
            }
            );
            if (!metaDescription) {
                metaDescription = "";
                console.log("No Meta description");
            }

            if (!metaKeyword) {
                metaKeyword = "";
                console.log("No Meta keywords");
            }
            var imageList = [];
            $('img').each(function (i, item) {
                if (!$(this).attr("alt")) {
                    var imageSrc = $(this).attr('src');
                    //if (S(imageSrc).contains('_tcm')) {
                        //console.log("No alt text :", S($(this).attr('src')).between('_tcm', '.').s);
                        if(S(imageSrc).startsWith('/'))
                        {
                            imageList.push(domainName + imageSrc);
                        }
                        else
                        {
                            imageList.push(imageSrc);
                        }
                        
                    //}
                }
            });

            var item = {
                description: metaDescription,
                keyword: metaKeyword,
                imageSource: imageList
            };

            console.log("item value:", item);

            parseData.push(item);
            res.render('mainContent', { data: parseData })
        }
        else {
            console.log(error);
            console.log("Page Not found")
            res.render('error')
        }
    });
})

app.listen(process.env.PORT || 8888);