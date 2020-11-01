import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'

import '../../client/layouts/HomeLayout.html'
import '../../client/layouts/MoviesLayout.html'

FlowRouter.route('/', {
    name: 'Home',
    action() {
        BlazeLayout.render("HomeLayout");
    }
});

FlowRouter.route('/search', {
    name: 'Movies',
    action() {
        BlazeLayout.render('MoviesLayout');
    },
});