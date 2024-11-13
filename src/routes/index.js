const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const user = req.session.user;
  // console.log("Usuario en la sesión:", user); 

  if (user) {
    switch (user.rol) {
      case "admin":
        console.log("Redirigiendo a la vista de admin");
        res.render("admin/home", { user });
        break;
      case "secretaria":
        console.log("Redirigiendo a la vista de secretaria");
        res.render("secretaria/home", { user });
        break;
      case "paciente":
        console.log("Redirigiendo a la vista de paciente");
        res.render("paciente/home", { user });;
        break;
    }
  } else {
    res.render("login", { user: null }); 
    console.log("Usuario en la sesión:",user); 

  }
});

module.exports = router;
