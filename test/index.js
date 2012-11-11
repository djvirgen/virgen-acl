// index.js - Test main simple-acl export
(function() {
  var assert = require('assert');

  var roles = ['admin', 'user', 'member', 'guest'];
  var resources = ['blog', 'page', 'site', 'login', 'register'];

  // tests
  describe('acl', function() {
    beforeEach(function() {
      this.acl = require('..');
    });

    describe('with defaults -- global deny all', function() {
      for (var i in roles) (function(role) {
        for (var j in resources) (function(resource) {
          it('should deny roll "' + role + '" to resource "' + resource + '"', function() {
            assert(this.acl.isAllowed(role, resource) == false);
            assert(this.acl.isDenied(role, resource) == true);
          });
        })(resources[i]);
      })(roles[i]);

      it("should honor LIFO stack", function() {
        this.acl.allow('foo', 'bar');
        this.acl.deny('foo', 'bar');
        assert(this.acl.isAllowed('foo', 'bar') == false);
      });

      describe('custom permissions', function() {
        beforeEach(function() {
          this.acl.permissions = [];
          this.acl.allow('user', 'page');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            if (role == 'user' && resource == 'page') {
              it('should allow role to resource', function() {
                assert(this.acl.isAllowed(role, resource) == true);
              });
            } else {
              it('should deny role to resource', function() {
                assert(this.acl.isAllowed(role, resource) == false);
              });
            }
          })(resources[i]);
        })(roles[i]);
      });

      describe('with global allow permission on role', function() {
        before(function(){
          this.acl.permissions = [];
          this.acl.allow('admin');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            if (role == 'admin') {
              it('should allow all resources to globally allowed role', function() {
                assert(this.acl.isAllowed(role, resource) == true);
              });
            } else {
              it('should deny all resources to all other roles', function() {
                assert(this.acl.isAllowed(role, resource) == false);
              });
            }
          })(resources[i]);
        })(roles[i]);
      });

      describe('with global allow permission on resource', function() {
        before(function(){
          this.acl.permissions = [];
          this.acl.allow(null, 'blog');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            if (resource == 'blog') {
              it('should allow all roles to globally allowed resource', function() {
                assert(this.acl.isAllowed(role, resource) == true);
              });
            } else {
              it('should deny all roles to all other resources', function() {
                assert(this.acl.isAllowed(role, resource) == false);
              });
            }
          })(resources[i]);
        })(roles[i]);
      });
    });

    describe('with global allow all', function() {
      before(function() {
        this.acl.permissions = [];
        this.acl.allow();
      });

      for (var i in roles) (function(role) {
        for (var j in resources) (function(resource) {
          it('should allow allow all roles to all resources', function() {
            assert(this.acl.isAllowed(role, resource) == true);
          });
        })(resources[i]);
      })(roles[i]);

      describe('with global deny permission on role', function() {
        before(function(){
          this.acl.permissions = [];
          this.acl.allow();
          this.acl.deny('guest');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            if (role == 'guest') {
              it('should deny all resources to globally denined roll', function() {
                assert(this.acl.isAllowed(role, resource) == false);
              });
            } else {
              it('should allow resources to all other rolls', function() {
                assert(this.acl.isAllowed(role, resource) == true);
              });
            }
          })(resources[i]);
        })(roles[i]);
      });

      describe('with global deny permission on resource', function() {
        before(function(){
          this.acl.permissions = [];
          this.acl.allow();
          this.acl.deny(null, 'blog');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            if (resource == 'blog') {
              it('should deny all roles to globally denined resource', function() {
                assert(this.acl.isAllowed(role, resource) == false);
              });
            } else {
              it('should allow roles to all other resources', function() {
                assert(this.acl.isAllowed(role, resource) == true);
              });
            }
          })(resources[i]);
        })(roles[i]);
      });
    });
  });
})();