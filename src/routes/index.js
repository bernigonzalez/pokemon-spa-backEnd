const { Router } = require('express');
const axios = require('axios')
const { Pokemon, Type } = require('../db');
const {
  getDbInfo,
  getApiInfo,
  getAllPokemons 
} = require('../controllers/controller')


// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


      router.get('/pokemons', async (req, res) => {
        let name = req.query.name
        
        try {
          let pokemonsTotal = await getAllPokemons()

          if (name) {
              let pokemonName = await pokemonsTotal.filter( (el) => el.name.toLowerCase().includes(name.toLowerCase()))
              pokemonName.length ? 
              res.status(200).send(pokemonName) :
              res.status(404).send("No Pokemon found by this name")
          } else {
              res.status(200).send(pokemonsTotal)    
          }
        }catch(err){
          console.log(err)
        }
  })

  



    
    // router.get("/pokemons/:id", async (req, res) => { //Busqueda por id
    //     try {
    //       //https://pokeapi.co/api/v2/pokemon/{id or name}/
    //       const id = req.params.id;
    //       const pokemonsTotal = await getAllPokemons();
    //       if (id) { //Si me pasan un ID, filtro el que coincida con ese mismo, sino devuelvo texto.
    //         let pokemonId = pokemonsTotal.filter((el) => el.id == id); 
    //         pokemonId.length
    //           ? res.status(200).json(pokemonId)
    //           : res.status(404).send("No se encontró un pokemon con ese ID");
    //       }
    //     } catch (error) {
    //       res.send("Server error. ")
    //     }
    //   });


      router.get("/pokemons/:id", async (req, res) => { //Busqueda por id
        try {
          //https://pokeapi.co/api/v2/pokemon/{id or name}/
          const id = req.params.id;
          //const pokemonsTotal = await getAllPokemons();
          console.log(typeof id)
          if(id.length < 10){
            const pokemon = await axios.get("https://pokeapi.co/api/v2/pokemon/" + id)
            res.status(200).json(pokemon.data)
          }else {
            const poke2 = await Pokemon.findByPk(id)
            res.status(200).json(poke2)
          }  
             } catch (error) {
               console.log(error)
          res.send("Server error. ")
        }
      });      



    router.get("/types", async (req, res) => {
        try {
            const api = await axios.get("https://pokeapi.co/api/v2/type"); //Trae todos los tipos
            const apiTypes = await api.data.results
            apiTypes.forEach(t => {
                     Type.findOrCreate({
                    where: {name: t.name}
                })
            })
            const allTypes = await Type.findAll();
            res.send(allTypes.length ? allTypes : 'No se encontro ningun type')    
        } catch (err) {
            res.status(500).send('Server error.')
        }
      });



    router.post("/pokemons", async (req, res) => {
        let { name, image, hp, attack, defense, speed, height, weight, types, createdInDb} = req.body
        //res.send(name)
        
        try {
            
            //res.send(name)
            let newPokemon = await Pokemon.create({
                name,
                image,
                hp,
                attack,
                defense,
                speed,
                height,
                weight
            })
            // let newPokemon =  {
            //     name,
            //     image,
            //     hp,
            //     attack,
            //     defense,
            //     speed,
            //     height,
            //     weight
            // }
            
            let DbType = await Type.findAll({
                where: {name : types}
            })
            //res.send(DbType)
    
            await newPokemon.addType(DbType)
            return res.send(newPokemon)
        
        }catch(err) {
            res.status(500).send('Server error.')
        }
    })  


module.exports = router;
