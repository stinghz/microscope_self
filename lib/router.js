Router.configure({
  layoutTemplate: 'layout',
  waitOn: function() {
    return [Meteor.subscribe('notifications')];
  },
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});



Router.route(
  '/post/:_id', {
     name: 'postPage',
     waitOn: function() {
//       return Meteor.subscribe('comments', this.params._id);
        return [
          Meteor.subscribe('singlePost', this.params._id),
          Meteor.subscribe('comments', this.params._id)
        ];
     },
     data: function() { return Posts.findOne(this.params._id); }
  }
);
Router.route('/submit', {name: 'postSubmit'});

Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function() {
    return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function() { return Posts.findOne(this.params._id); }
});

// Router.route('/', {name: 'postsList'});
PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5,
  postsLimit: function() {
    return parseInt(this.params.postsLimit) || this.increment;
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.postsLimit()};
  },
//   waitOn: function() {
//     return Meteor.subscribe('posts', this.findOptions());
//   },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
//     var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
//       nextPath: hasMore ? nextPath : null
       nextPath: hasMore ? this.nextPath() : null
    };
  }
});

NewPostsController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});
BestPostsController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});
Router.route('/', {
  name: 'home',
  controller: NewPostsController
});
Router.route('/new/:postsLimit?', {name: 'newPosts'});
Router.route('/best/:postsLimit?', {name: 'bestPosts'});

// Router.route('/:postsLimit?', {
//   name: 'postsList'
// });

Router.onBeforeAction('dataNotFound', {only: 'postPage'});


var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
}
//requireLogin function must be defined before this call.
Router.onBeforeAction(requireLogin,   {only: 'postSubmit'});