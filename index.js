module.exports = (function(){
  var Acl, Permission;

  // Access Control List -- Main class
  Acl = (function(){
    function Acl() {
      this.permissions = [];
    }

    Acl.prototype.allow = function(role, resource) {
      this.permissions.push(new Permission(role || null, resource || null, true));
    };

    Acl.prototype.deny = function(role, resource) {
      this.permissions.push(new Permission(role || null, resource || null, false));
    };

    Acl.prototype.isAllowed = function(role, resource) {
      // LIFO
      var result = false;

      for (var i = this.permissions.length - 1; i >= 0; i--) {
        result = this.permissions[i].isAllowed(role || null, resource || null);
        if (null != result) break; // Found a match
      }

      return !!result; // cast to boolean
    };

    Acl.prototype.isDenied = function(role, resource) {
      return !this.isAllowed(role, resource);
    };

    return Acl;
  })();

  // Permission class used to store permission details and determine matches
  Permission = (function(){
    function Permission(role, resource, allowed){
      this.role = role;
      this.resource = resource;
      this.allowed = allowed;
    };

    Permission.prototype.isAllowed = function(role, resource){
      if (this.role == null && this.resource == null) return this.allowed; // Global rule
      if (this.role == role && this.resource == null) return this.allowed; // Global rule on role
      if (this.role == null && this.resource == resource) return this.allowed; // Global rule on resource
      if (role == this.role && resource == this.resource) return this.allowed; // Exact match
      return null; // No match
    };

    return Permission;
  })();

  return new Acl;
})();