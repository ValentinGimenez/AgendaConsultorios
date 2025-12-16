const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const user = req.session.user;
  // console.log("Usuario en la sesión:", user); 

  if (user) {
    switch (user.rol) {
      case "admin":
        console.log("Redirigiendo a la vista de admin");
        //res.render("admin/home", { user });
        res.redirect("/medico/lista");
        break;
      case "secretaria":
        console.log("Redirigiendo a la vista de secretaria");
        //res.render("secretaria/home", { user });
        res.redirect("/turno/listar");
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
// router.get("/login", async (req, res) => {
//   try {
//     res.render("login");
//   } catch (error) {
//     console.error("Error al renderizar la vista de login:", error);
//     res.status(500).render("error", { error: "Error al renderizar la vista de login" });
//   }
// });

module.exports = router;
