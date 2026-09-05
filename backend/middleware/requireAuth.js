const { supabase } = require('../config/supabase');

const requireAuth = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token || !supabase) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session.' });
  }

  req.user = data.user;
  next();
};

module.exports = requireAuth;
