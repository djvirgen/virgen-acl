Virgen ACL
==========

Simple in-memory ACL for node.js apps. Supports arbitrary roles and resources
while honoring a LIFO stack.

Installation
------------

    npm install virgen-acl

Usage
-----

    // Load library
    var Acl = require('virgen-acl").Acl
      , acl = new Acl();

    // Set up roles
    acl.addRole("guest");                     // guest user
    acl.addRole("member", "guest");           // member inherits permissions from guest
    acl.addRole("admin");                     // Admin inherits from no one

    // Set up resources
    acl.addResource("blog");                  // blog resource
    acl.addResource("page");                  // blog resource

    // Set up access rules (LIFO)
    acl.deny();                               // deny all by default
    acl.allow("admin");                       // allow admin access to everything
    acl.allow("member", "blog", "comment");   // allow members to comment on blogs
    acl.allow(null, "blog", "view");          // allow everyone to view the blogs
    acl.allow("guest", "blog", ["list", "search"]) // supports arrays of actions

    // Query the ACL
    acl.isAllowed("member", "blog", "comment", function(err, allowed) {
      if (allowed) {
        // commenting allowed!
      } else {
        // no commenting allowed!
      }
    });

Role and Resource Discovery
---------------------------

If you are more of an object-oriented programmer and prefer to use objects
to represent your roles and resource, then you're in luck! Virgen-ACL can
discover roles and resources from your objects so long as your role objects
contain the property `role_id` OR a function `getRoleId()` and your resource
objects contain the property `resource_id` OR a function `getResourceId()`.
Here's an example of how that might work:

    // User class
    var User = (function(){
      User = function(attribs) {
        this.id = attribs.id || null;
      }

      User.prototype.getRoleId = function() {
        if (this.id) {
          return "member"; // members have an ID
        } else {
          return "guest"; // all other users are guests
        }
      }

      return User;
    })();

    // Blog class
    var Blog = (function(){
      Blog = function(attribs) {
        this.resource_id = "blog";
        this.status = attribs.status || "draft";
      };

      return Blog;
    })();

    var userA = new User();
    userA.getRoleId(); // returns "guest"
    var userB = new User({id: 123});
    userB.getRoleId(); // return "member"

    var blog = new Blog();
    blog.resource_id; // set to "blog"

    // Set up ACL
    var acl = new Acl();
    acl.addRole("guest");                   // guest inherits from no one
    acl.addRole("member", "guest");         // member inherits from guest
    acl.allow("guest", "blog", "view");     // guests allowed to view blog
    acl.allow("member", "blog", "comment"); // member allowed to comment on blog

    acl.isAllowed(userA, blog, "view", function(err, allowed) {
      // userA is a guest and can view blogs
      assert(allowed == true);
    });

    acl.isAllowed(userA, blog, "comment", function(err, allowed) {
      // userA is a guest and cannot comment on blogs
      assert(allowed == false);
    });

    acl.isAllowed(userB, blog, "view", function(err, allowed) {
      // userB is a member and inherits view permission from guest
      assert(allowed == true);
    });

    acl.isAllowed(userB, blog, "comment", function(err, allowed) {
      // userB is a member and has permission to comment on blogs
      assert(allowed == false);
    });

Custom Assertions
-----------------

Sometimes you need more complex rules when determining access. Custom
assertions can be provided to perform additional logic on each matching
ACL query:

    acl.allow("member", "blog", "edit", function(role, resource, action, next, result) {
      // Use next() if unable to determine permission based on provided arguments
      if (!(role instanceof User) || !(resource instanceof Blog))
        return next();

      if (role.id == resource.user_id) {
        // resource belongs to this role, allow editing
        result(true);
      } else {
        // resource does not belong to this role, do not allow editing
        result(false);
      }
    });