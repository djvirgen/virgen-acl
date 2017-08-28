require('should');


// index.js - Test main virgen-acl export
(function() {
  var assert = require('assert')
    , Acl = require('../lib').Acl
    , roles = ['admin', 'member', 'guest', ['member', 'admin'], ['member', 'guest'], ['guest', 'member']]
    , resources = ['blog', 'page', 'site']
    , actions = ['view', 'create', 'edit', 'delete'];

  // User class
  var User = function(role) {
    return {
      getRoleId: function() {
          return role;
      }
    };
  }

  // Resource class
  var Resource = function() {
    return {
      resource_id: 'resource'
    };
  }

  // tests
  describe('acl', function() {
    beforeEach(function() {
      this.acl = new Acl();
    });

    describe('role', function() {
      beforeEach(function() {
        this.acl = new Acl();
      });

      it("supports null", function(done) {
        this.acl.allow(null, 'foo', 'bar');
        this.acl.query(null, 'foo', 'bar', function(err, allowed) {
          allowed.should.equal(true);
          done();
        });
      });

      it('supports role inheritance', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);
        this.acl.allow(parent, resource, action);

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(true); // child can access resource
          done();
        });
      });

      it('denies if not allowed and parent is not allowed', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(false); // child cannot access resource
          done();
        });
      });

      it('denies if custom assertions cannot resolve, async', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);
        this.acl.allow(parent, resource, action, function(err, role, resource, action, result, next) {
          setTimeout(function() {
            next();
          });
        });

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(false); // child cannot access resource
          done();
        });
      });

      it('denies if custom assertions cannot resolve, sync', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);
        this.acl.allow(parent, resource, action, function(err, role, resource, action, result, next) {
          next();
        });

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(false); // child cannot access resource
          done();
        });
      });

      it('allows if not allowed and but parent is allowed using custom assertions', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);
        this.acl.allow(parent, resource, action, function(err, role, resource, action, result, next) {
          setTimeout(function() {
            if (child === role) return result(null, true);
            return next();
          });
        });

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(true); // child can access resource
          done();
        });
      });

      it('denies if parent is denied after child is allowed', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);
        this.acl.allow(child, resource, action);
        this.acl.deny(parent, resource, action);

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(false); // child cannot access resource because parent was denied after child rule
          done();
        });
      });

      it('allows if child is allowed after parent is denied', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);
        this.acl.deny(parent, resource, action);
        this.acl.allow(child, resource, action);

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(true); // child can access resource because it was allowed after parent rule
          done();
        });
      });

      it('denies if not allowed and parent is not allowed using custom assertions', function(done) {
        var parent = 'parent';
        var child = 'child';
        var resource = 'resource';
        var action = 'action';
        this.acl.addRole(parent);
        this.acl.addRole(child, parent);
        this.acl.allow(parent, resource, action, function(err, role, resource, action, result, next) {
          setTimeout(function() {
            if (child === role) return result(null, false);
            return next();
          });
        });

        this.acl.query(child, resource, action, function(err, allowed) {
          allowed.should.equal(false); // child cannot access resource
          done();
        });
      });
    });

    describe('resource', function() {
      beforeEach(function(){
        this.acl = new Acl();
      });

      it("handles null resource", function(done) {
        this.acl.allow('foo', null, 'bar');
        this.acl.query('foo', null, 'bar', function(err, allowed) {
          allowed.should.equal(true);
          done();
        });
      });

      it('supportss resource inheritance', function() {
        var role = 'role';
        var parent = 'parent';
        var child = 'child';
        var action = 'action';
        this.acl.addResource(parent);
        this.acl.addResource(child, parent);
        this.acl.allow(role, parent, action);

        this.acl.query(role, child, action, function(err, allowed) {
          allowed.should.equal(true); // role can also access child resource
        });
      });

      it('denies if not allowed and parent resource is not allowed', function() {
        var role = 'role';
        var parent = 'parent';
        var child = 'child';
        var action = 'action';
        this.acl.addResource(parent);
        this.acl.addResource(child, parent);

        this.acl.query(role, child, action, function(err, allowed) {
          allowed.should.equal(false); // role cannot also access child resource
        });
      });

      it('denies if custom assertions cannot resolve permission, async', function(done) {
        var role = 'role';
        var parent = 'parent';
        var child = 'child';
        var action = 'action';
        this.acl.addResource(parent);
        this.acl.addResource(child, parent);
        this.acl.allow(role, parent, action, function(err, role, resource, action, result, next) {
          setTimeout(function() {
            next();
          });
        });

        this.acl.query(role, child, action, function(err, allowed) {
          allowed.should.equal(false); // child resource is not accessible
          done();
        });
      });

      it('denies if custom assertions cannot resolve permission, sync', function(done) {
        var role = 'role';
        var parent = 'parent';
        var child = 'child';
        var action = 'action';
        this.acl.addResource(parent);
        this.acl.addResource(child, parent);
        this.acl.allow(role, parent, action, function(err, role, resource, action, result, next) {
          next();
        });

        this.acl.query(role, child, action, function(err, allowed) {
          allowed.should.equal(false); // child resource is not accessible
          done();
        });
      });

      it('allows if not allowed and but parent resource is allowed using custom assertions', function(done) {
        var role = 'role';
        var parent = 'parent';
        var child = 'child';
        var action = 'action';
        this.acl.addResource(parent);
        this.acl.addResource(child, parent);
        this.acl.allow(role, parent, action, function(err, role, resource, action, result, next) {
          setTimeout(function() {
            if (child === resource) return result(null, true);
            return next();
          });
        });

        this.acl.query(role, child, action, function(err, allowed) {
          allowed.should.equal(true); // child resource is accessible
          done();
        });
      });

      it('denies if not allowed and parent resource is not allowed using custom assertions', function(done) {
        var role = 'role';
        var parent = 'parent';
        var child = 'child';
        var action = 'action';
        this.acl.addResource(parent);
        this.acl.addResource(child, parent);
        this.acl.allow(role, parent, action, function(err, role, resource, action, result, next) {
          setTimeout(function() {
            if (child === resource) return result(null, false);
            return next();
          });
        });

        this.acl.query(role, child, action, function(err, allowed) {
          allowed.should.equal(false); // child resource is not accessible
          done();
        });
      });
    });

    describe("action", function() {
      var allowedActions = ['view', 'comment', 'list'];
      var deniedActions = ['delete', 'edit', 'publish'];

      beforeEach(function(){
        this.acl = new Acl();
        this.acl.allow('foo', 'bar', allowedActions);
        this.acl.deny('foo', 'bar', deniedActions);
        this.acl.allow('derp', 'doo');
      });

      for (var i in allowedActions) (function(action) {
        it("allows all actions specified in array", function(done) {
          this.acl.query('foo', 'bar', action, function(err, allowed) {
            allowed.should.equal(true);
            done();
          });
        });
      })(allowedActions[i]);

      for (var i in deniedActions) (function(action) {
        it("denies all actions specified in array", function(done) {
          this.acl.query('foo', 'bar', action, function(err, allowed) {
            allowed.should.equal(false);
            done();
          });
        });
      })(deniedActions[i]);

      it("supports wildcard actions", function(done) {
        this.acl.query('derp', 'doo', 'anything', function(err, allowed) {
          allowed.should.equal(true);
          done();
        });
      });
    });

    describe('query', function() {
      beforeEach(function() {
        this.acl = new Acl();
      });

      for (var i in roles) (function(role) {
        for (var j in resources) (function(resource) {
          for (var k in actions) (function(action) {
            it('denies role "' + role + '" to resource "' + resource + '" for action "' + action + '"', function(done) {
              this.acl.query(role, resource, action, function(err, allowed) {
                 allowed.should.equal(false);
                 done();
              });
            });
          })(actions[k]);
        })(resources[j]);
      })(roles[i]);

      it("honors LIFO stack", function(done) {
        this.acl.allow('foo', 'bar', 'derp');
        this.acl.deny('foo', 'bar', 'derp');

        this.acl.query('foo', 'bar', 'derp', function(err, allowed) {
          allowed.should.equal(false);
          done();
        });
      });

      describe("custom assertions", function() {
        beforeEach(function() {
          this.acl = new Acl();
        })

        it("runs when checking permissions", function(done) {
          this.acl.allow('foo', 'bar', 'derp', function(err, role, resource, action, result, next) {
            role.should.equal('foo');
            resource.should.equal('bar');
            action.should.equal('derp');
            result(null, false);
          });

          this.acl.query('foo', 'bar', 'derp', function(err, allowed) {
            allowed.should.equal(false);
            done();
          });
        });
      });

      describe('custom permissions', function() {
        beforeEach(function() {
          this.acl = new Acl();
          this.acl.allow('member', 'page', 'view');
        });

        for (var i in roles) (function(role) {
          for (var j in resources) (function(resource) {
            for (var k in actions) (function(action) {
              var allowableRole = false;
              if(role === 'member' || (Array.isArray(role) && role.indexOf('member') !== -1)) {
                allowableRole = true;
              }

              if (allowableRole && resource == 'page' && action == 'view') {
                it('allows role to resource', function(done) {
                  this.acl.query(role, resource, action, function(err, allowed) {
                    assert(allowed == true);
                    done();
                  });
                });
              } else {
                it('denies role to resource', function(done) {
                  this.acl.query(role, resource, action, function(err, allowed) {
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
              var allowableRole = false;
              if(role === 'admin' || (Array.isArray(role) && role.indexOf('admin') !== -1)) {
                allowableRole = true;
              }

              if (allowableRole) {
                it('allows all resources to globally allowed role', function() {
                  this.acl.query(role, resource, action, function(err, allowed){
                    assert(allowed == true);
                  });
                });
              } else {
                it('denies all resources to all other roles', function() {
                  this.acl.query(role, resource, action, function(err, allowed){
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
                it('allows all roles to globally allowed resource', function(done) {
                  this.acl.query(role, resource, action, function(err, allowed){
                    allowed.should.equal(true);
                    done();
                  });
                });
              } else {
                it('denies all roles to all other resources', function(done) {
                  this.acl.query(role, resource, action, function(err, allowed) {
                    allowed.should.equal(false);
                    done();
                  });
                });
              }
            })(actions[k]);
          })(resources[j]);
        })(roles[i]);
      });

      describe('object oriented interface', function() {
        beforeEach(function() {
          this.acl = new Acl();
        });

        it('supports objects with getRoleId()', function(done) {
          var user = new User('guest');
          var resource = new Resource();

          this.acl.allow('guest', 'resource', 'action');
          this.acl.query(user, resource, 'action', function(err, allowed) {
            allowed.should.equal(true);
            done();
          })
        });

        it('supports objects with multiple roles', function(done) {
          var user = new User(['blog-admin', 'product-admin']);
          var resource = new Resource();

          this.acl.allow('product-admin', 'resource', 'action');
          this.acl.query(user, resource, 'action', function(err, allowed) {
            allowed.should.equal(true);
            done();
          });
        });

        it('passes the role object to allow handler', function(done) {
          var user = new User(['blog-admin', 'product-admin']);
          var resource = new Resource();
          this.acl.allow('product-admin', 'resource', null, function(err, role, resource, action, result, next) {
            role.should.equal(user);
            done();
          });

          this.acl.query(user, resource, 'action', function(err, allowed) {
            // noop
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
            it('allows allow all roles to all resources', function() {
              this.acl.query(role, resource, action, function(err, allowed) {
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
              var deniableRole = false;
              if(role === 'guest' || (Array.isArray(role) && role.indexOf('guest') !== -1)) {
                deniableRole = true;
              }

              if (deniableRole) {
                it(`denies ${action} of ${resource} to guest`, function() {
                  this.acl.query(role, resource, action, function(err, allowed) {
                    allowed.should.equal(false);
                  });
                });
              } else {
                it(`allows ${action} of ${resource} to ${role}`, function(done) {
                  this.acl.query(role, resource, action, function(err, allowed) {
                    allowed.should.equal(true);
                    done();
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
                it(`denies ${role} to blog`, function(done) {
                  this.acl.query(role, resource, action, function(err, allowed) {
                    allowed.should.equal(false);
                    done();
                  });
                });
              } else {
                it(`allows ${role} to ${resource}`, function(done) {
                  this.acl.query(role, resource, action, function(err, allowed) {
                    allowed.should.equal(true);
                    done();
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
