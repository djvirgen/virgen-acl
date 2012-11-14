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
    acl.addRole('guest');                     // guest user
    acl.addRole('member', 'guest');           // member inherits permissions from guest
    acl.addRole('admin');                     // Admin inherits from no one

    // Set up resources
    acl.addResource('blog');                  // blog resource
    acl.addResource('page');                  // blog resource

    // Set up access rules (LIFO)
    acl.deny();                               // deny all by default
    acl.allow('admin');                       // allow admin access to everything
    acl.allow('member', 'blog', 'comment');   // allow members to comment on blogs
    acl.allow(null, 'blog', 'view');          // allow everyone to view the blogs

    // Query the ACL
    acl.isAllowed('member', 'blog', 'comment', function(err, allowed) {
      if (allowed) {
        // commenting allowed!
      } else {
        // no commenting allowed!
      }
    });

Custom Assertions
-----------------

Sometimes you need more complex rules when determining access. Custom
assertions can be provided to perform additional logic on each matching
ACL query:

    acl.allow('member', 'blog', 'edit', function(role, resource, action, next, result) {
      // Use next() if unable to determine permission based on provided arguments
      if (!role instanceof User || !resource instanceof Blog) return next();

      if (role.id == resource.user_id) {
        // resource belongs to this role, allow editing
        result(true);
      } else {
        // resource does not belong to this role, do not allow editing
        result(false);
      }
    });