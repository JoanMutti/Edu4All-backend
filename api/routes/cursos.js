const express = require("express");
const fetch = require("node-fetch")
const { isAuthenticated, hasRoles } = require("../auth");
const Cursos = require("../models/Cursos");
const Videos = require("../models/Videos");
const Tags = require("../models/Tags");
const Users = require("../models/Users");

const router = express.Router();

//Delete all courses and videos
// router.delete('/deleteAll', async (req, res) => {
//   await Users.deleteMany({role: 'user'})
//   await Cursos.deleteMany({})
//   await Videos.deleteMany({})
//   await Tags.deleteMany({})

//   res.send('todo ok')
// })

router.get('/extern-videos', async (req, res) => {
  const resp = await fetch('https://salty-ravine-66488.herokuapp.com/videos')
  const data = await resp.json()
  res.send(data)
})

//Bring most valorate courses
router.get("/top", async (req, res) => {
  const cursos = await Cursos.find()
    .populate("videos")
    .sort({ "valoracion.valor": -1 })
    .limit(10)
    .exec();
  res.status(200).send(cursos);
});

//Delete a tag
router.delete("/tags/:id", (req, res) => {
  Tags.findByIdAndDelete(req.params.id)
    .exec()
    .then((x) => res.status(200).send("tag eliminado"));
});

//Create a new tag
router.post("/tags",  isAuthenticated, hasRoles(["admin"]), (req, res) => {
  console.log(req.body);
  tag = req.body;
  Tags.find({ nombre: tag.nombre })
    .exec()
    .then((tagExist) => {
      if (tagExist.length > 0) {
        return res.status(200).send("Tag ya existe");
      }
      Tags.create(req.body).then((x) => res.status(201).send(x));
    });
});

//Bring all tags
router.get("/tags", (req, res) => {
  Tags.find()
    .exec()
    .then((x) => res.status(200).send(x))
    .catch((err) => res.status(403).send("No existen tags"));
});

//Bring all courses
router.get("/", (req, res) => {
  Cursos.find()
    .populate({
      path: "videos",
      select: ["imagen", "nombre", "videoId"],
    })
    .exec()
    .then((x) => res.status(200).send(x));
});

//Bring an specific course by Id
router.get("/:id", isAuthenticated, hasRoles(["user", "admin"]), (req, res) => {
  Cursos.findById(req.params.id)
    .populate("videos")
    .exec()
    .then((x) => {
      console.log(x);
      res.status(200).send(x);
    });
});

//Create a course
router.post("/", isAuthenticated, hasRoles(["admin"]), (req, res) => {
  Cursos.create(req.body).then((x) => res.status(201).send(x));
});

//Update course
router.put("/:id", isAuthenticated, hasRoles(["admin"]), (req, res) => {
  Cursos.findByIdAndUpdate(req.params.id, req.body).then(() =>
    res.sendStatus(204)
  );
});

//Delete course and all course's videos
router.delete("/:id", isAuthenticated, hasRoles(["admin"]), (req, res) => {
  Cursos.findById(req.params.id)
    .exec()
    .then((curso) => {
      if (curso.videos.length >= 1) {
        curso.videos.forEach((element) => {
          Videos.findByIdAndDelete(element)
            .exec()
            .then(() => {
              Cursos.findByIdAndDelete(req.params.id)
                .exec()
                .then(() => res.status(200).send("Curso eliminado con exito"));
            });
        });
      } else {
        Cursos.findByIdAndDelete(req.params.id)
          .exec()
          .then(() => res.status(200).send("Curso eliminado con exito"));
      }
    });
});

router.put(
  "/rate/:id",
  isAuthenticated,
  hasRoles(["user", "admin"]),
  (req, res) => {
    //find user and search for finished course
    Users.findById(req.user._id)
      .exec()
      .then((user) => {
        const isRated = user.cursosTerminados.some(
          (element) => element.idCurso === req.params.id
        );
        if (isRated) {
          res.status(200).send("Ya valoraste este curso");
        } else {
          user.cursosTerminados.push({
            idCurso: req.params.id,
            valoracion: req.body.valoracion,
          });
          Users.findByIdAndUpdate(req.user._id, user).then(() => {
            if (req.body.valoracion > 0 && req.body.valoracion <= 5) {
              Cursos.findById(req.params.id)
                .exec()
                .then((curso) => {
                  let { valoracion } = curso;
                  valoracion.sumaTotal += req.body.valoracion;
                  valoracion.cantVotos++;
                  valoracion.valor = Math.round(
                    valoracion.sumaTotal / valoracion.cantVotos
                  );
                  curso.valoracion = valoracion;
                  Cursos.findByIdAndUpdate(req.params.id, curso).then(() => {
                    res.status(200).send("curso valorado");
                  });
                });
            } else {
              res.status(200).send("numero de valoracion invalido");
            }
          });
        }
      });
  }
);



module.exports = router;
