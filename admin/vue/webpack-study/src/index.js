import $ from 'jquery';
import './css/index.css';
import './css/scss.scss';
import '../node_modules/bootstrap/dist/css/bootstrap.css'
$(function () {
    $('li:even').css({background: 'green'});
    $('li:odd').css({background: 'blue'});
})