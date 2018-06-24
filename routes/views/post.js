var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'blog';
	locals.filters = {
		post: req.params.post,
	};
	locals.data = {
		posts: [],
	};

	// Load the current post
	view.on('init', function (next) {
		// From https://gist.github.com/paulbrie/42ecc35a75b1372d7227c57249c0ae3c
		// Default behavior
		var postSearch = {
			slug: locals.filters.post,
			state: 'published',
		};

		// Allow admin user to see the post in all cases by removing post state
		if (locals.user && locals.user.isAdmin) {
			delete postSearch.state;
		}

		var q = keystone.list('Post').model.findOne(postSearch).populate('author categories');

		q.exec(function (err, result) {
			locals.data.post = result;
			next(err);
		});

	});

	// Load other posts
	view.on('init', function (next) {

		var q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('4');

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});

	});

	// Render the view
	view.render('post');
};