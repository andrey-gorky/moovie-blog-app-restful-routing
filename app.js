var bodyParser = require("body-parser"),
	expressSanitizer = require("express-sanitizer"),
	methodOverride = require("method-override"),
	mongoose = require("mongoose"),
	express = require("express"),
	app = express();

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_movie_blog_app", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
// app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); //Should be placed after bodyParser!
app.use(express.static("partials"));
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var movieSchema = new mongoose.Schema({
	title: String,
	poster: String,
	plot: String,
	release: Number,
	created: { type: Date, default: Date.now }
});

var Movies = mongoose.model("Movies", movieSchema);

// Movies.create({
// 	title: "Joker",
// 	poster: "https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SY1000_CR0,0,674,1000_AL_.jpg",
// 	plot: "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.",
// 	release: 2019
// });

// RESTFUL ROUTES
app.get("/", function (req, res) {
	res.redirect("/movies");
});

//INDEX ROUTE
app.get("/movies", function (req, res) {
	Movies.find({}, function (err, movies) {
		if (err) {
			console.log(err);
		} else {
			res.render("index.ejs", { moviesEjs: movies });
		}
	});
});

//NEW ROUTE
app.get("/movies/new", function (req, res) {
	res.render("new.ejs");
});

//CREATE ROUTE
app.post("/movies", function (req, res) {
	console.log(req.body);
	console.log("=======================================================================");
	req.body.movies.plot = req.sanitize(req.body.movies.plot);
	console.log(req.body);
	Movies.create(req.body.movies, function (err, movie) {
		if (err) {
			console.log(err);
			res.render("new.ejs");
		} else {
			res.redirect("/movies");
		}
	});
});

//SHOW ROUTE
app.get("/movies/:id", function (req, res) {
	Movies.findById(req.params.id, function (err, movieInfo) {
		if (err) {
			console.log(err);
			res.redirect("/movies");
		} else {
			res.render("movie-info.ejs", { movieInfo: movieInfo });
		}
	});
});

//EDIT ROUTE
app.get("/movies/:id/edit", function (req, res) {
	Movies.findById(req.params.id, function (err, movieInfo) {
		if (err) {
			console.log(err);
			res.redirect("/movies");
		} else {
			res.render("edit.ejs", { movieInfo: movieInfo });
		}
	});
});

//UPDATE ROUTE
app.put("/movies/:id", function (req, res) {
	req.body.movies.plot = req.sanitize(req.body.movies.plot);
	console.log("=======================================================================");
	console.log(req.body);
	Movies.findByIdAndUpdate(req.params.id, req.body.movies, function (err, movieUpdated) {
		if (err) {
			console.log(err);
			res.redirect("/movies");
		} else {
			res.redirect("/movies/" + req.params.id);
		}
	})
});

//DELETE ROUTE
app.delete("/movies/:id/", function (req, res) {

	Movies.findByIdAndRemove(req.params.id, function (err, movieDelete) {
		if (err) {
			console.log(err);
			res.redirect("/movies/" + req.params.id);
		} else {
			res.redirect("/movies");
		}
	});

});

app.listen(3000, function () {
	console.log("Server is running...");
});