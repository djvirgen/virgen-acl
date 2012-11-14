require('should');

// index.js - Test main virgen-acl export
(function() {
  var assert = require('assert')
    , Acl = require('../lib').Acl
    , roles = ['admin', 'member', 'guest']
    , resources = ['blog', 'page', 'site']
    , actions = ['view', 'create', 'edit', 'delete'];

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
          for (var k in actions) (function(action) {
            it('should deny role "' + role + '" to resource "' + resource + '" for action "' + action + '"', function(done) {
              this.acl.isAllowed(role, resource, action, function(err, allowed) {
                 allowed.should.equal(false);
                 done();
              });
            });
          })(actions[k]);
        })(resources[j]);
      })(roles[i]);

      it("should honor LIFO stack", function(done) {
        this.acl.allow('foo', 'bar', 'derp');
        this.acl.deny('foo', 'bar', 'derp');

        this.acl.isAllowed('foo', 'bar', 'derp', function(err, allowed) {
          allowed.should.equal(false);
          done();
        });
      });

      describe("custom assertions", function() {
        beforeEach(function() {
          this.acl = new Acl();
        })

        it("should run when checking permissions", function(done) {
          this.acl.allow('foo', 'bar', 'derp', function(err, role, resource, action, next, result) {
            role.should.equal('foo');
            resource.should.equal('bar');
            action.should.equal('derp');
            result(null, false);
          });

          this.acl.isAllowed('foo', 'bar', 'derp', function(err, allowed){
            allowed.should.equal(false);
            done();
          });
        });
      });

      describe('custom permissions', function() {
        beforeEach(function() {
          this.acl = new Acl();
          this.acl.allow('user', 'page', 'view');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            for (var k in actions) (function(action) {
              if (role == 'user' && resource == 'page' && action == 'view') {
                it('should allow role to resource', function(done) {
                  this.acl.isAllowed(role, resource, action, function(err, allowed) {
                    assert(allowed == true);
                    done();
                  });
                });
              } else {
                it('should deny role to resource', function(done) {
                  this.acl.isAllowed(role, resource, action, function(err, allowed) {
                    assert(allowed == false);
                    done();
                  });
                });
              }
            })(actions[k]);
          })(resources[j]);
        })(roles[i]);
      });

      describe('with global allow permission on role', function() {
        beforeEach(function(){
          this.acl = new Acl();
          this.acl.allow('admin');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            for (var k in actions) (function(action) {
              if (role == 'admin') {
                it('should allow all resources to globally allowed role', function() {
                  this.acl.isAllowed(role, resource, action, function(err, allowed){
                    assert(allowed == true);
                  });
                });
              } else {
                it('should deny all resources to all other roles', function() {
                  this.acl.isAllowed(role, resource, action, function(err, allowed){
                    assert(allowed == false);
                  })
                });
              }
            })(actions[k]);
          })(resources[j]);
        })(roles[i]);
      });

      describe('with global allow permission on resource', function() {
        beforeEach(function(){
          this.acl = new Acl();
          this.acl.allow(null, 'blog');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            for (var k in actions) (function(action) {
              if (resource == 'blog') {
                it('should allow all roles to globally allowed resource', function(done) {
                  this.acl.isAllowed(role, resource, action, function(err, allowed){
                    allowed.should.equal(true);
                    done();
                  });
                });
              } else {
                it('should deny all roles to all other resources', function(done) {
                  this.acl.isAllowed(role, resource, action, function(err, allowed) {
                    allowed.should.equal(false);
                    done();
                  });
                });
              }
            })(actions[k]);
          })(resources[j]);
        })(roles[i]);
      });

      describe('role', function() {
        beforeEach(function(){
          this.acl = new Acl();
        });

        it('supports role inheritance', function(done) {
          var parent = 'parent';
          var child = 'child';
          var resource = 'resource';
          var action = 'action';
          this.acl.addRole(parent);
          this.acl.addRole(child, parent);
          this.acl.allow(parent, resource, action);

          this.acl.isAllowed(child, resource, action, function(err, allowed) {
            allowed.should.equal(true); // child can access resource
            done();
          });
        });
      });

      describe('resource', function() {
        beforeEach(function(){
          this.acl = new Acl();
        });

        it('supports resource inheritance', function() {
          var role = 'role';
          var parent = 'parent';
          var child = 'child';
          var action = 'action';
          this.acl.addResource(parent);
          this.acl.addResource(child, parent);
          this.acl.allow(role, parent, action);

          this.acl.isAllowed(role, child, action, function(err, allowed) {
            allowed.should.equal(true); // role can also access child resource
          });
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
          for (var k in actions) (function(action) {
            it('should allow allow all roles to all resources', function() {
              this.acl.isAllowed(role, resource, action, function(err, allowed) {
                allowed.should.equal(true);
              });
            });
          })(actions[k]);
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
            for (var k in actions) (function(action) {
              if (role == 'guest') {
                it('should deny all resources to globally denined role', function() {
                  this.acl.isAllowed(role, resource, action, function(err, allowed) {
                    allowed.should.equal(false);
                  });
                });
              } else {
                it('should allow resources to all other roles', function() {
                  this.acl.isAllowed(role, resource, action, function(err, allowed) {
                    allowed.should.equal(true);
                  });
                });
              }
            })(actions[k]);
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
            for (var k in actions) (function(action) {
              if (resource == 'blog') {
                it('should deny all roles to globally denined resource', function() {
                  this.acl.isAllowed(role, resource, action, function(err, allowed) {
                    allowed.should.equal(false);
                  });
                });
              } else {
                it('should allow roles to all other resources', function() {
                  this.acl.isAllowed(role, resource, action, function(err, allowed) {
                    allowed.should.equal(true);
                  });
                });
              }
            })(actions[k]);
          })(resources[j]);
        })(roles[i]);
      });
    });
  });
})();