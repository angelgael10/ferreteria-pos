<?php
// Entrada personalizada de Adminer: fuerza español y mantiene el servidor local.
namespace docker {
	function adminer_object() {
		require_once('plugins/plugin.php');

		class Adminer extends \AdminerPlugin {
			function _callParent($function, $args) {
				if ($function === 'loginForm') {
					ob_start();
					$return = \Adminer::loginForm();
					$form = ob_get_clean();

					echo str_replace('name="auth[server]" value="" title="hostname[:port]"', 'name="auth[server]" value="'.($_ENV['ADMINER_DEFAULT_SERVER'] ?: 'db').'" title="hostname[:port]"', $form);

					return $return;
				}

				return parent::_callParent($function, $args);
			}
		}

		$plugins = [];
		foreach (glob('plugins-enabled/*.php') as $plugin) {
			$plugins[] = require($plugin);
		}

		return new Adminer($plugins);
	}
}

namespace {
	if (!isset($_COOKIE['adminer_lang']) || $_COOKIE['adminer_lang'] !== 'es') {
		$_COOKIE['adminer_lang'] = 'es';
		setcookie('adminer_lang', 'es', time() + 60 * 60 * 24 * 30, '/');
	}

	ob_start();
	register_shutdown_function(function () {
		$html = ob_get_clean();
		$textos = [
			'<title>Login - Adminer</title>' => '<title>Iniciar sesión - Adminer</title>',
			'>Login</h2>' => '>Iniciar sesión</h2>',
			'value="Login"' => 'value="Iniciar sesión"',
			"value='Login'" => "value='Iniciar sesión'",
			'<span title="Base de datos">DB</span>' => '<span title="Base de datos">Base</span>',
			"<span title='Base de datos'>DB</span>" => "<span title='Base de datos'>Base</span>",
		];
		echo str_replace(array_keys($textos), array_values($textos), $html);
	});

	if (basename($_SERVER['DOCUMENT_URI'] ?? $_SERVER['REQUEST_URI']) === 'adminer.css' && is_readable('adminer.css')) {
		header('Content-Type: text/css');
		readfile('adminer.css');
		exit;
	}

	function adminer_object() {
		return \docker\adminer_object();
	}

	require('adminer.php');
}
