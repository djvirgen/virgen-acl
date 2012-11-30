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
  var roles
    , resources
    , matches = [];

  // LIFO loop, starting with specified role/resource and moving up through parents
  roles = getParentRoles.call(this, role);
  resources = getParentResources.call(this, resource);

  for (var i in roles) (function(_role){
    for (var j in resources) (function(_resource){
      for (var k = this.permissions.length - 1; k >= 0; k--) (function(test_role, test_resource, test_permission) {
        if (test_permission.match(test_role || null, test_resource || null, action || null)) {
          matches.push(test_permission);
        }
      })(_role, _resource, this.permissions[k]);
    }).call(this, resources[j]);
  }).call(this, roles[i]);

  var pl = new PermissionList(matches, role, resource, action, done);
  pl.next();
};

// Private

var getParentRole = function(role) {
  return this.roles[role] || null;
};

var getParentRoles = function(role) {
  var roles = [];

  do {
    roles.push(role);
  } while (role = getParentRole.call(this, role));

  return roles;
};

var getParentResources = function(resource) {
  var resources = [resource];

  do {
    resources.push(resource);
  } while (resource = getParentResource.call(this, resource));

  return resources;
};

var getParentResource = function(resource) {
  return this.resources[resource] || null;
};

module.exports = Acl;
