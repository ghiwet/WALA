function f(){ 
	return {}
}
f.prototype.foo = function f2 (){}
f.prototype.zoo = function f3(){}
var x = new f(5, 6, 7);
x.foo(2);
x.zoo();
f();