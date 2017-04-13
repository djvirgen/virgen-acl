
/// <reference path="../../typings.d.ts" />

import * as virgen from 'virgen-acl'

const acl = new virgen.Acl()


// Set up roles
acl.addRole("guest");                     // guest user, inherits from no one
acl.addRole("member", "guest");           // member inherits permissions from guest
acl.addRole("admin");                     // Admin inherits from no one

// Set up resources
acl.addResource("blog");                  // blog resource, inherits no resources

// Set up access rules (LIFO)
acl.deny();                               // deny all by default
acl.allow("admin");                       // allow admin access to everything
acl.allow("member", "blog", "comment");   // allow members to comment on blogs
acl.allow(null, "blog", "view");          // allow everyone to view the blogs
acl.allow("guest", "blog", ["list", "search"]) // supports arrays of actions

// Query the ACL
acl.query("member", "blog", "comment", function(err, allowed) {
  if (allowed) {
    // commenting allowed!
  } else {
    // no commenting allowed!
  }
});

// supports multiple roles in query
acl.query(["member", "admin"], "blog", "create", function(err, allowed) {
    if (allowed) {
      // creating allowed!
    } else {
      // no creating allowed!
    }
});

// User class
class User implements virgen.IRoleGetter {

  public id:number

  constructor(opts:{id:number}) {
    this.id = opts.id
  }

  getRoleId() {
    return "user"
  }
}

// Blog class
class Blog implements virgen.IResourceProp {

  public resource_id:string

  constructor() {
    this.resource_id = "blog"
  }

}

var userA = new User({id: 123});
userA.getRoleId(); // returns "guest"
var userB = new User({id: 124});
userB.getRoleId(); // return "member"

var blog = new Blog();
blog.resource_id; // set to "blog"

acl.addRole("guest");                   // guest inherits from no one
acl.addRole("member", "guest");         // member inherits from guest
acl.allow("guest", "blog", "view");     // guests allowed to view blog
acl.allow("member", "blog", "comment"); // member allowed to comment on blog

acl.query(userA, blog, "view", function(err, allowed) {
  // userA is a guest and can view blogs
  assert(allowed == true);
});

acl.query(userA, blog, "comment", function(err, allowed) {
  // userA is a guest and cannot comment on blogs
  assert(allowed == false);
});

acl.query(userB, blog, "view", function(err, allowed) {
  // userB is a member and inherits view permission from guest
  assert(allowed == true);
});

acl.query(userB, blog, "comment", function(err, allowed) {
  // userB is a member and has permission to comment on blogs
  assert(allowed == false);
});

const assert = (truthy:boolean) => {
  if(!truthy) throw new Error("assertion failed")
}