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
  if (!isArray(actions)) actions = [actions];
  for (var i in actions)
    this.permissions.push(new Permission(role || null, resource || null, actions[i] || null, assertion || true));
};

Acl.prototype.deny = function(role, resource, actions, assertion) {
  if (!isArray(actions)) actions = [actions];
  for (var i in actions)
    this.permissions.push(new Permission(role || null, resource || null, actions[i] || null, assertion || false));
};

Acl.prototype.query = function(role, resource, action, done) {
  // LIFO
  var roles
    , resources
    , matches = []
    , extractedRole = extractRole(role);

  // LIFO loop, starting with specified role/resource and moving up through parents
  roles = isArray(extractedRole)
    ? getParentRolesFromArray.call(this, extractedRole)
    : getParentRoles.call(this, extractedRole);

  resources = getParentResources.call(this, resource);

  for (var k = this.permissions.length - 1; k >= 0; k--)
    for (var i in roles)
      for (var j in resources)
        if (this.permissions[k].match(roles[i] || null, resources[j] || null, action || null)) {
          matches.push(this.permissions[k]);
        }

  var pl = new PermissionList(matches, role, resource, action, done);
  pl.next();
};

// Private
var getParentRolesFromArray = function(role) {
  var roles = [];
  for (var i in role) {
    var parentRoles = getParentRoles.call(this, role[i]);
    parentRoles = parentRoles.filter(function (item, pos) { return roles.indexOf(item) < 0 });
    roles = roles.concat(parentRoles);
  }

  return roles;
}

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
  var resources = [];

  do {
    resources.push(resource);
  } while (resource = getParentResource.call(this, resource));

  return resources;
};

var getParentResource = function(resource) {
  return this.resources[resource] || null;
};

var isArray = Array.isArray || function (vArg) {
  return Object.prototype.toString.call(vArg) === "[object Array]";
};

function extractRole(role) {
  if (typeof(role) == 'string' || isArray(role)) {
    return role;
  } else if (null === role) {
    return null;
  } else if (typeof(role.getRoleId) == 'function') {
    return role.getRoleId();
  } else if (typeof(role.role_id) == 'string' || isArray(role.role_id)) {
    return role.role_id;
  } else {
    throw "Unable to determine role";
  }
};

module.exports = Acl;
