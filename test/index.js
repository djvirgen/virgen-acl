// index.js - Test main virgen-acl export
(function() {
  var assert = require('assert')
    , Acl = require('..').Acl
    , roles = ['admin', 'member', 'guest']
    , resources = ['blog', 'page', 'site'];

  // tests
  describe('acl', function() {
    beforeEach(function() {
      this.acl = new Acl();
    });

    describe('with defaults -- global deny all', function() {
      beforeEach(function() {
        this.acl = new Acl();
      });

      for (var i in roles) (function(role) {
        for (var j in resources) (function(resource) {
          it('should deny role "' + role + '" to resource "' + resource + '"', function() {
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
          this.acl = new Acl();
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
        beforeEach(function(){
          this.acl = new Acl();
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
        beforeEach(function(){
          this.acl = new Acl();
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
          })(resources[j]);
        })(roles[i]);
      });

      describe('role', function() {
        beforeEach(function(){
          this.acl = new Acl();
        });

        it('supports role inheritance', function() {
          var parent = 'parent';
          var child = 'child';
          this.acl.addRole(parent);
          this.acl.addRole(child, parent);

          // Initially, neither parent nor child can access resource
          assert(this.acl.isAllowed(parent, 'foo') == false);
          assert(this.acl.isAllowed(child, 'foo') == false);

          // Allow the parent, and the child can also access resource
          this.acl.allow(parent, 'foo');
          assert(this.acl.isAllowed(parent, 'foo') == true); // parent can now access resource
          assert(this.acl.isAllowed(child, 'foo') == true); // child can also access resource
        });
      });

      describe('resource', function() {
        beforeEach(function(){
          this.acl = new Acl();
        });

        it('supports resource inheritance', function() {
          var parent = 'parent';
          var child = 'child';
          this.acl.addResource(parent);
          this.acl.addResource(child, parent);

          // Initially, neither parent nor child can access resource
          assert(this.acl.isAllowed('foo', parent) == false);
          assert(this.acl.isAllowed('foo', child) == false);

          // Allow the parent, and the child can also access resource
          this.acl.allow('foo', parent);
          assert(this.acl.isAllowed('foo', parent) == true); // role can now access resource
          assert(this.acl.isAllowed('foo', child) == true); // role can also access child resource
        });
      });
    });

    describe('with global allow all', function() {
      beforeEach(function() {
        this.acl = new Acl();
        this.acl.allow();
      });

      for (var i in roles) (function(role) {
        for (var j in resources) (function(resource) {
          it('should allow allow all roles to all resources', function() {
            assert(this.acl.isAllowed(role, resource) == true);
          });
        })(resources[j]);
      })(roles[i]);

      describe('with global deny permission on role', function() {
        beforeEach(function(){
          this.acl = new Acl();
          this.acl.allow();
          this.acl.deny('guest');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            if (role == 'guest') {
              it('should deny all resources to globally denined role', function() {
                assert(this.acl.isAllowed(role, resource) == false);
              });
            } else {
              it('should allow resources to all other roles', function() {
                assert(this.acl.isAllowed(role, resource) == true);
              });
            }
          })(resources[j]);
        })(roles[i]);
      });

      describe('with global deny permission on resource', function() {
        beforeEach(function(){
          this.acl = new Acl();
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