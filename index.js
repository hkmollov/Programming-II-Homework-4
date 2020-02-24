const express = require('express');
const handlebars = require('express-handlebars');
const fs = require('fs');

const app = express();
const port = 3000

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

app.use(express.urlencoded({extended: true}));

const artPath = "./articles";

app.get("/", function (req, res) {
    //get all articles
    let articles = fs.readdirSync(artPath);
    //sort articles by date modified (latest first)
    articles = articles.map(function (fileName) {
        return {
            name: fileName,
            time: fs.statSync(artPath + '/' + fileName).mtime.getTime()
        };
    }).sort(function (a, b) {
        const artA = JSON.parse(fs.readFileSync(`${artPath}/${a.name}` , {encoding: "utf-8"}));
        const artB = JSON.parse(fs.readFileSync(`${artPath}/${b.name}` , {encoding: "utf-8"}));
        return artB.datePublished - artA.datePublished;
    }).map(function (v) {
        return v.name;
    });
    //create article list
    let articleList = [];
    for (let i in articles) {
        const data = fs.readFileSync(`${artPath}/${articles[i]}` , {encoding: "utf-8"});
        const article = JSON.parse(data);
        articleList.push({
            heading: article.headline,
            image: article.teaserImageURL,
            teaser: article.teaserText,
            id: articles[i].replace(".json", "")
        })
    }
    res.render("home", {
        css: "style",
        articles: articleList
    });
});

app.get('/article/:id', (request, response) => {

    const fileName = `${artPath}/${request.params.id}.json`;

    if(fs.existsSync(fileName)){
        const articleString = fs.readFileSync(fileName);
        const article = JSON.parse(articleString);
        response.render('article', {
            css: "style",
            article: article
        });
    } else {
        response.render('not-found');
    }
});

app.use(express.static('public'));

app.listen(port, () => console.log(`News app listening on port ${port}!`))