var Permission = require('./permission');
var PermissionList = require('./permission_list');

var Acl = (function() {
  function Acl() {
    this.permissions = [];
    this.roles = {};
    this.resources = {};
  }

  Acl.prototype.addRole = function(role, parent) {
    this.roles[role] = parent || null;
  };

  Acl.prototype.addResource = function(resource, parent) {
    this.resources[resource] = parent || null;
  };

  Acl.prototype.allow = function(role, resource, actions, assertion) {
    if (!(actions instanceof Array)) actions = [actions];
    for (var i in actions) (function(action) {
      this.permissions.push(new Permission(role || null, resource || null, action || null, assertion || true));
    }).call(this, actions[i]);
  };

  Acl.prototype.deny = function(role, resource, actions, assertion) {
    if (!(actions instanceof Array)) actions = [actions];
    for (var i in actions) (function(action) {
      this.permissions.push(new Permission(role || null, resource || null, action || null, assertion || false));
    }).call(this, actions[i]);
  };

  Acl.prototype.query = function(role, resource, action, done) {
    // LIFO
    var i
      , _role
      , _resource
      , matches = [];

    // LIFO loop, starting with specified role/resource and moving up through parents
    _role = role;
    do {
      _resource = resource;
      do {
        for (i = this.permissions.length - 1; i >= 0; i--) (function(test_role, test_resource, test_permission) {
          if (test_permission.match(test_role || null, test_resource || null, action || null)) {
            matches.push(test_permission);
          }
        })(_role, _resource, this.permissions[i]);
      } while (_resource = getParentResource.call(this, _resource));
    } while (_role = getParentRole.call(this, _role));

    var pl = new PermissionList(matches, role, resource, action, done);
    pl.next();
  };

  // Private

  var getParentRole = function(role) {
    return this.roles[role] || null;
  };

  var getParentResource = function(resource) {
    return this.resources[resource] || null;
  };

  return Acl;
})();

module.exports = Acl;