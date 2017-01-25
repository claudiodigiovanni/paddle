// grab the things we need
var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Circolo = require('./circolo.js');
var installationSchema = require('./installation.js').installationSchema;
var Schema = mongoose.Schema;




// create a schema
var userSchema = new Schema({
  email: { type: String, required: true,  unique: true  },
  password: { type: String, required: true },
  role: { type: String, required: false},
  circolo: { type: Schema.Types.ObjectId, ref: 'Circolo' },
  enabled: { type: Boolean},
  nome: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  residualCredit: { type: Number},
  created_at: Date,
  updated_at: Date,
  level: String,
  status: String,
  jwtToken: String,
  username: { type: String, required: true ,  unique: true }
  /*preferences: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  image: String,
  installations: [installationSchema]*/
});




userSchema.pre('save', function (next) {
  
  var user = this;
  var currentDate = new Date();
  // change the updated_at field to current date
  user.updated_at = currentDate;
	
 if (user.isNew)
  user.nome = user.nome.toLowerCase()

  // if created_at doesn't exist, add to that field
  if (!user.created_at)
    user.created_at = currentDate;
	
    if (user.isModified('password') || user.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
				//throw err
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
					//throw err
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

userSchema.methods.comparePassword = function (passw,cb) {
	console.log('comparePassword:' + passw)
	console.log('comparePassword:' + this.password)
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            console.log("errore")
			return false
			
        }
		console.log(isMatch)
        cb(null, isMatch);
    });
};






// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
