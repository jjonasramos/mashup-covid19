var appAngular = angular.module( "appCovid", ['ngRoute'] );

appAngular.config(['$httpProvider',  
  function($httpProvider) {

    if(!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.common = {};
    }          

    $httpProvider.defaults.headers.common["If-Modified-Since"] = "0";
    $httpProvider.defaults.headers.common["Cache-Control"] = "no-cache";     
    $httpProvider.defaults.headers.common.Pragma = "no-cache";                     
  }
]);

appAngular.config( function ($routeProvider,$locationProvider) {
	
	$locationProvider.hashPrefix('');

	$routeProvider

	.when("/",{
		templateUrl: "dashboard.html",
		controller: "DashboardController"
	})
	.otherwise ({
		redirectTo: '/'
	});
} );

var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );
var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
require.config( {
	baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources"
} );

require( ["js/qlik"], function ( qlik ) {
	qlik.setOnError( function ( error ) {
		$( '#popupText' ).append( error.message + "<br>" );
		$( '#popup' ).fadeIn( 9999999 );
	} );
	$( "#closePopup" ).click( function () {
		$( '#popup' ).hide();
	} );
	
	/*appAngular.run(function ($rootScope) {

		$rootScope.limparTudo = function() {
			console.log('entrei aqui ');
			app.clearAll();
			
			$rootScope.dataSet.forEach(function(item) {
				item.isSelected = false;
			});
		}
		
	});*/
	

	appAngular.controller("DashboardController", ['$scope', '$location', function ( $scope, $location, $rootScope ) {
	
		$scope.taxaRA = true;
	
		$scope.setVariableMap = function() {
		
			if($scope.taxaRA)
				app.variable.setNumValue('vMostraTaxa', 0);
			else
				app.variable.setNumValue('vMostraTaxa', 1);
			
			$scope.taxaRA = !$scope.taxaRA;
		}
		
		$scope.selectKPIValue = function(type, value) {
			switch(type) {
				case 0:
					app.field('[classificacaoFinal]').selectValues([value], true, true);
					break;
				case 1:
					app.field('[Estado de Saúde]').selectValues([value], true, true);
					break;
				case 2:
					app.field('[Hospitalizacao]').selectValues([value], true, true);
					break;
			}
		}
		
		/*$scope.selectRA = function(e) {
			app.field('RA').selectValues([{qText: e.x.RA}], true, true);
			e.x.isSelected = !e.x.isSelected;
		}*/

		app.createGenericObject( {
			reloadTime : { qStringExpression: "=ReloadTime()" },

			total_casos : { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, AtivoInativo = {'Ativo'}>}[Record ID]), '#.##0')" },
			total_casos_p : { qStringExpression: "Num((Count({<MesDia = {'$(vMaxMesDia)'}, AtivoInativo = {'Ativo'}>}[Record ID])/Count({<Data = {'$(=Date(Max(Data)-1))'}, AtivoInativo = {'Ativo'}>}[Record ID]))-1, '#.##0,#%')" },
			novos_casos : { qStringExpression: "Num(Count({<Data = {'$(=Max(Data))'}>}[Record ID]) - Count({<Data = {'$(=Date(Max(Data)-1))'}>}[Record ID]), '#.##0')" },

			homem: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino}>}[Record ID]), '#.##0')" },
			homem_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino, Feminino}>}[Record ID]), '#.##0,#%')" },

			mulher: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Feminino}>}[Record ID]), '#.##0')" },		
			mulher_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Feminino}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino, Feminino}>}[Record ID]), '#.##0,#%')" },	

			grave: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Moderado', 'Leve', 'Não Informado'}, classificacaoFinal = {Ignorado}>}[Record ID]), '#.##0')" },
			grave_p: { qStringExpression: "Num((Count({< [Estado de Saúde] -= {'Moderado', 'Leve', 'Não Informado'}, Data = {'$(vMaxData)'}, classificacaoFinal = {Ignorado}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,00%')" },	

			moderado: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Grave', 'Leve', 'Não Informado'}, classificacaoFinal = {Ignorado}>}[Record ID]), '#.##0')" },	
			moderado_p: { qStringExpression: " Num((Count({< [Estado de Saúde] -= {'Grave', 'Leve', 'Não Informado'}, Data = {'$(vMaxData)'}, classificacaoFinal = {Ignorado}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,00%')" },

			leve: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Moderado', 'Grave', 'Não Informado'}, classificacaoFinal = {Ignorado}>}[Record ID]), '#.##0')" },	
			leve_p: { qStringExpression: "Num((Count({< [Estado de Saúde] -= {'Moderado', 'Grave', 'Não Informado'}, Data = {'$(vMaxData)'}, classificacaoFinal = {Ignorado}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,00%')" },	

			emAnalise: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Moderado', 'Leve', 'Grave'}, classificacaoFinal = {Ignorado}>}[Record ID]), '#.##0')" },	
			emAnalise_p: { qStringExpression: "Num((Count({<  [Estado de Saúde] -= {'Moderado', 'Leve', 'Grave'}, Data = {'$(vMaxData)'}, classificacaoFinal = {Ignorado}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,00%')" },	

			recuperado: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Óbito', 'Ignorado'}>}[Record ID]), '#.##0')" },	
			recuperado_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal = {'Óbito', 'Ignorado'}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}>}[Record ID]), '#.##0,#%')" },	

			obito: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Cura', 'Ignorado'}>}[Record ID]), '#.##0')" },	
			obito_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Cura', 'Ignorado'}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}>}[Record ID]), '#.##0,#%')" },	

			hospitalizados: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, Quarentena = {Hospital}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#.##0')" },	
			hospitalizados_p: { qStringExpression: "Num((Count({<MesDia = {'$(vMaxMesDia)'}, Quarentena = {Hospital}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID])/Count({<Data = {'$(=Date(Max(Data)-1))'}, Quarentena = {Hospital}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]))-1, '#.##0,#%')" },	

			uti: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, Hospitalizacao -= {Enfermaria, 'Não Informado'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#.##0')" },	
			uti_p: { qStringExpression: "Num((Count({<MesDia = {'$(vMaxMesDia)'}, Hospitalizacao -= {'Enfermaria', 'Não Informado'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]) / Count({<MesDia = {'$(vMaxMesDia)'}, Quarentena = {Hospital}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID])), '#.##0,#%')" },	

			enfermaria: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, Hospitalizacao -= {'UTI', 'Não Informado'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#.##0')" },	
			enfermaria_p: { qStringExpression: "Num(Num(Count({<MesDia = {'$(vMaxMesDia)'}, Hospitalizacao -={'UTI', 'Não Informado'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}, Quarentena = {Hospital}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#,00%'), '#.##0,#%')" },
		
	
		}, function ( reply ) {
			$('#reloadTime').html(reply.reloadTime);
			$('#posicao').css('visibility', 'visible');

			$('#kpi-df-total-casos').html(reply.total_casos);
			$('#kpi-df-total-casos-p').html(reply.total_casos_p);
			$('#kpi-df-novos-casos').html(reply.novos_casos);
			
			$('#novos-casos').css('visibility', 'visible');
			
			
			$('#kpi-df-homem').html(reply.homem);
			$('#kpi-df-mulher').html(reply.mulher);
			$('#kpi-df-homem-percent').html(reply.homem_p);
			$('#kpi-df-mulher-percent').html(reply.mulher_p);

			$('#kpi-df-grave').html(reply.grave);
			$('#kpi-df-grave-p').html(reply.grave_p);
			$('#info-bar-grave').css('width', reply.grave_p.replace(',', '.'));

			$('#kpi-df-moderado').html(reply.moderado);
			$('#kpi-df-moderado-p').html(reply.moderado_p);
			$('#info-bar-moderado').css('width', reply.moderado_p.replace(',', '.'));

			$('#kpi-df-leve').html(reply.leve);
			$('#kpi-df-leve-p').html(reply.leve_p);
			$('#info-bar-leve').css('width', reply.leve_p.replace(',', '.'));

			$('#kpi-df-analise').html(reply.emAnalise);
			$('#kpi-df-analise-p').html(reply.emAnalise_p);
			$('#info-bar-ni').css('width', reply.emAnalise_p.replace(',', '.'));

			$('#kpi-df-recuperado').html(reply.recuperado);
			$('#kpi-df-recuperado-p').html(reply.recuperado_p);
			$('#info-bar-recuperado').css('width', reply.recuperado_p.replace(',', '.'));

			$('#kpi-df-obito').html(reply.obito);
			$('#kpi-df-obito-p').html(reply.obito_p);
			$('#info-bar-obito').css('width', reply.obito_p.replace(',', '.'));
			
			$('#kpi-df-total-hospitalizados').html(reply.hospitalizados);
			$('#kpi-df-uti').html(reply.uti);
			$('#kpi-df-enfermaria').html(reply.enfermaria);
			
			$('#kpi-df-total-hospitalizados-p').html(reply.hospitalizados_p);
			$('#kpi-df-uti-p').html(reply.uti_p);
			$('#kpi-df-enfermaria-p').html(reply.enfermaria_p);
			
			$('#info-bar-uti').css('width', reply.uti_p.replace(',', '.'));
			$('#info-bar-enfermaria').css('width', reply.enfermaria_p.replace(',', '.'));
			
			$scope.hosp_p = Number(reply.hospitalizados_p.replace(',', '.').replace('%', '')) >= 0;
			
			
			// CRIAR A TABELA
			var cubo = app.createTable(["RA"], 
									   ["Count({< Data = {'$(vMaxData)'}, RA -= {'Outros Estados'}>}[Record ID]) / (if(GetSelectedCount(RA) = 0, sum({1< Data >} População), sum({< Data >} População))  / 100000)",
									   "Count({<Data_ext = {$(=Max(Data_ext))}>}[Record ID])",
									   "(Count({<Data = {'$(=Max(Data))'}>}[Record ID]) - Count({<Data = {'$(=Date(Max(Data)-1))'}>}[Record ID]) > 0)",
	"if(not isnull(Count({< Data = {'$(vMaxData)'}, RA -= {'Outros Estados'}>}[Record ID]) / (if(GetSelectedCount(RA) = 0, sum({1< Data >} População), sum({< Data >} População))/100000)),Count({<Data = {'$(=Max(Data))'}>}[Record ID]) - Count({<Data = {'$(=Date(Max(Data)-1))'}>}[Record ID]) > 0)"],
									{rows:200});

			var listener = function() {

				var rowCount = cubo.rowCount;
				$scope.dataSet = [];

				for (let i = 0; i < 41; i++) {
					let aux_row = {};

					aux_row = {
						RA: cubo.rows[i].cells[0].qText,
						Taxa: (cubo.rows[i].cells[1].qText == '-' ? 0 : cubo.rows[i].cells[1].qNum).toFixed(1),
						Casos: cubo.rows[i].cells[2].qNum,
						Check_casos: cubo.rows[i].cells[3].qNum == -1 ? true : false,
						Check_taxa: cubo.rows[i].cells[4].qNum == -1 ? true : false,
						isSelected: false
					};

					$scope.dataSet.push(aux_row);
				}

				cubo.OnData.unbind( listener );
			};

			cubo.OnData.bind( listener );
			
			app.getObject('chart-df-age', 'LRDxMsm');

			app.visualization.get('955aaf98-542a-4a2d-b2b6-0d67829fca68').then(function(vis) {
				vis.show("mapa-df-01");
				$('#loading').css('opacity', 0);
				
				setTimeout(function() {
					$('#loading').css('display', 'none');
					$('.flex-container').css('overflow', 'auto');
				}, 500);
				
			});

			app.visualization.get('GApQgX').then(function(vis) {
				vis.model.layout.showTitles = false;
				vis.show("chart-df-02");
				vis.model.layout.showTitles = false;
			});

		});
			
			
	}]);
	
	angular.bootstrap( document, ["appCovid", "qlik-angular"] );

	app = qlik.openApp('7aea1372-8df0-4c7b-bcec-018567491372');
	
	qlik.theme.apply('ssp white');
});
