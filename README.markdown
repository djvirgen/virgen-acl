Virgen ACL
==========

Simple in-memory ACL for node.js apps. Supports arbitrary roles and resources
while honoring a LIFO stack.

Usage
-----

    // Load library
    var Acl = require('virgen-acl').Acl
      , acl = new Acl();

    // Set up roles
    acl.addRole('guest'); // guest user
    acl.addRole('member', 'guest'); // member inherits permissions from guest
    acl.addRole('admin'); // Admin inherits from no one

    // Set up resources
    acl.addResource('blog:view');             // view a blog
    acl.addResource('blog:create');           // create a blog
    acl.addResource('blog:comment');          // comment on a blog

    // Set up access rules (LIFO)
    acl.deny();                               // deny all by default
    acl.allow('admin');                       // allow admin access to everything
    acl.allow('member', 'blog:comment');      // allow members to post comments
    acl.allow(null, 'blog:view');             // allow everyone to view the blog

    // Query the ACL
    acl.isAllowed('admin', 'blog:create');    // returns true
    acl.isAllowed('member', 'blog:create');   // returns false
    acl.isAllowed('guest', 'blog:create');    // returns false
    acl.isAllowed('admin', 'blog:comment');   // returns true
    acl.isAllowed('member', 'blog:comment');  // returns true
    acl.isAllowed('guest', 'blog:comment');   // returns false
    acl.isAllowed('admin', 'blog:view');      // returns true
    acl.isAllowed('member', 'blog:view');     // returns true
    acl.isAllowed('guest', 'blog:view');      // returns true
