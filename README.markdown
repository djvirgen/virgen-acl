Virgen ACL
==========

Simple in-memory ACL for node.js apps. Supports arbitrary roles and resources
while honoring a LIFO stack.

Usage
-----

    // Load library
    var acl = require('virgen-acl');

    // Set up access rules
    acl.deny();                               // deny all, default
    acl.allow('admin');                       // allow admin access to everything
    acl.allow('member', 'post_comment');      // allow members to post comments
    acl.allow(null, 'view_blog');             // allow everyone to view the blog

    // Query the ACL
    acl.isAllowed('admin', 'post_blog');      // returns true
    acl.isAllowed('member', 'post_blog');     // returns false
    acl.isAllowed('guest', 'post_blog');      // returns false
    acl.isAllowed('admin', 'post_comment');   // returns true
    acl.isAllowed('member', 'post_comment');  // returns true
    acl.isAllowed('guest', 'post_comment');   // returns false
    acl.isAllowed('admin', 'view_blog');      // returns true
    acl.isAllowed('member', 'view_blog');     // returns true
    acl.isAllowed('guest', 'view_blog');      // returns true