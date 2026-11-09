package mk.vraboti.security;

import mk.vraboti.model.Role;

public record CurrentUser(Long id, Role role) {}
