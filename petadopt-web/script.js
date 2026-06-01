// Supabase Configuration - Replace with your actual credentials
const SUPABASE_URL = 'https://emmqczfbbarxxzzeiwrn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jxCAFiBZVS7jpt8V7b9woQ_r17bR5V5';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');

// DOM Elements
const loading = document.getElementById('loading');
const successCard = document.getElementById('success-card');
const resetCard = document.getElementById('reset-card');
const resetForm = document.getElementById('reset-form');
const resetSuccess = document.getElementById('reset-success');
const resetError = document.getElementById('reset-error');
const errorMessage = document.getElementById('error-message');
const submitBtn = document.getElementById('submit-btn');

// Initialize page based on type
async function init() {
    try {
        // Detectar si es un callback de OAuth (Google)
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const code = urlParams.get('code');

        if (hashAccessToken && hashRefreshToken) {
            // OAuth callback con tokens en el hash
            console.log('🔗 OAuth callback detectado con tokens en hash');
            const { error } = await supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken,
            });
            if (error) throw error;

            // Redirigir con el deep link de la app (query params, no hash)
            const appDeepLink = 'petadopt://auth/callback?access_token=' + encodeURIComponent(hashAccessToken) + '&refresh_token=' + encodeURIComponent(hashRefreshToken);
            window.location.href = appDeepLink;
            return;
        }

        if (code) {
            // OAuth con PKCE flow
            console.log('🔗 OAuth callback detectado con code');
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const appDeepLink = 'petadopt://auth/callback?access_token=' + encodeURIComponent(session.access_token) + '&refresh_token=' + encodeURIComponent(session.refresh_token);
                window.location.href = appDeepLink;
            }
            return;
        }

        if (type === 'signup') {
            // Handle email confirmation
            if (accessToken && refreshToken) {
                // Set the session from URL parameters
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (error) throw error;

                // Show success card
                loading.classList.add('hidden');
                successCard.classList.remove('hidden');
            } else {
                throw new Error('No se encontraron tokens de acceso');
            }
        } else if (type === 'recovery') {
            // Handle password reset
            if (accessToken && refreshToken) {
                // Set the session from URL parameters
                const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (error) throw error;

                // Show reset form
                loading.classList.add('hidden');
                resetCard.classList.remove('hidden');
            } else {
                throw new Error('No se encontraron tokens de acceso');
            }
        } else {
            throw new Error('Tipo de acción no válido');
        }
    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('hidden');
        resetCard.classList.remove('hidden');
        resetForm.classList.add('hidden');
        resetError.classList.remove('hidden');
        errorMessage.textContent = error.message || 'Ocurrió un error al procesar tu solicitud';
    }
}

// Handle password reset form submission
resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    // Validate password length
    if (newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Actualizando...';

    try {
        // Update password
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;

        // Show success
        resetForm.classList.add('hidden');
        resetSuccess.classList.remove('hidden');
    } catch (error) {
        console.error('Error updating password:', error);
        resetForm.classList.add('hidden');
        resetError.classList.remove('hidden');
        errorMessage.textContent = error.message || 'Error al actualizar la contraseña';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Actualizar Contraseña';
    }
});

// Initialize on page load
init();
