package com.handstats.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Placeholder UserDetailsService.
 * <p>
 * TODO: Remplacer par une implémentation réelle basée sur MongoDB
 * une fois le modèle de données utilisateur défini.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // ──────────────────────────────────────────────
        // PLACEHOLDER : à connecter à MongoDB
        // ──────────────────────────────────────────────
        throw new UsernameNotFoundException(
                "Utilisateur non trouvé : " + username +
                " (UserDetailsService placeholder — à implémenter)");
    }
}
