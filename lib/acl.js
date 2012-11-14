var Permission = require('./permission');
var PermissionList = require('./permission_list');

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

Acl.prototype.allow = function(role, resource, action, assertion) {
  this.permissions.push(new Permission(role || null, resource || null, action || null, assertion || true));
};

Acl.prototype.deny = function(role, resource, action, assertion) {
  this.permissions.push(new Permission(role || null, resource || null, action || null, assertion || false));
};

Acl.prototype.getParentRole = function(role) {
  return this.roles[role] || null;
}

Acl.prototype.getParentResource = function(resource) {
  return this.resources[resource] || null;
}

Acl.prototype.isAllowed = function(role, resource, action, done) {
  // LIFO
  var _role = role
    , _resource = resource
    , matches = [];

  // LIFO loop, starting with specified role/resource and moving up through parents
  _role = role;
  do {
    _resource = resource;
    do {
      for (var i = this.permissions.length - 1; i >= 0; i--) (function(i_role, i_resource, i_permission) {
        if (i_permission.match(i_role || null, i_resource || null, action || null)) {
          matches.push(i_permission);
        }
      })(_role, _resource, this.permissions[i]);
    } while (_resource = this.getParentResource(_resource));
  } while (_role = this.getParentRole(_role));

  var pl = new PermissionList(matches, role, resource, action, done);
  pl.next();
};

Acl.prototype.isDenied = function(role, resource, action, done) {
  this.isAllowed(role, resource, action, function(err, allowed){
    if (err) return done(err);
    done(null, !allowed);
  });
};

module.exports = Acl;