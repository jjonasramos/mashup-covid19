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
	

	appAngular.controller("DashboardController", ['$scope', '$location', function ( $scope, $location, $rootScope ) {
	
		app.variable.getContent('vMostraTaxa', function (reply) {
			$scope.taxaRA = reply.qContent.qString == '0' ? false : true;
		});

		$scope.setVariableMap = function() {
		
			app.variable.setNumValue('vMostraTaxa', !$scope.taxaRA);
			$scope.taxaRA = !$scope.taxaRA;
		}
		
		$scope.selectKPIValue = function(type, value) {

			switch(type) {
				case 1:
					if(typeof value === 'object')
						app.field('[Estado de Saúde]').selectValues(value, true, true);
					else
						app.field('[Estado de Saúde]').selectValues([value], true, true);
					break;
				case 2:
					app.field('[Hospitalizacao]').selectValues([value], true, true);
					break;
				case 3:
					app.field('[sexo]').selectValues([value], true, true);
					break;
					
				case 5:
					app.field('id_comorbidades').selectAll();
					break;
					
				case 6:
					app.field('id4').selectPossible();
					break;
					
				case 7:
					app.field('Flag_DF').selectValues([value], true, true);
					break;
					
				case 'pcr':
					app.field('[testeRT_PCR]').selectValues([value], true, true);
					break;
					
				case 'rapida':
					app.field('[testeRapido]').selectValues([value], true, true);
					break;
					
				case 'cardio':
					app.field('[Cardiovasculopatia]').selectValues([value], true, true);
					break;
				case 'meta':
					app.field('[Distúrbios Metabólicos]').selectValues([value], true, true);
					break;
				case 'pneumo':
					app.field('[Pneumopatia]').selectValues([value], true, true);
					break;
					
				case 'imuno':
					app.field('[Imunopressão]').selectValues([value], true, true);
					break;
					
				case 'nefro':
					app.field('[Nefropatia]').selectValues([value], true, true);
					break;
					
				case 'obe':
					app.field('[Obesidade]').selectValues([value], true, true);
					break;
					
				case 'hemato':
					app.field('[Doença Hematológica]').selectValues([value], true, true);
					break;
					
				case 'outros':
					app.field('[Outros]').selectValues([value], true, true);
					break;
					
				case 'hospital':
					app.field('[Quarentena]').selectValues([value], true, true);
					break;
					
				case 'RA':
					app.field('[RA]').selectValues([value], true, true);
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
			novos_casos : { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, AtivoInativo = {'Ativo'}>}[Record ID]) - Count({<Data = {'$(=Date(Max(Data)-1))'}, AtivoInativo = {'Ativo'}>}[Record ID]), '#.##0')" },

			homem: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino}>}[Record ID]), '#.##0')" },
			homem_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino, Feminino}>}[Record ID]), '#.##0,#%')" },

			mulher: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Feminino}>}[Record ID]), '#.##0')" },		
			mulher_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Feminino}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}, sexo = {Masculino, Feminino}>}[Record ID]), '#.##0,#%')" },	

			grave: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Moderado', 'Leve', 'Não Informado'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#.##0')" },
			grave_p: { qStringExpression: "Num((Count({< [Estado de Saúde] -= {'Moderado', 'Leve', 'Não Informado'}, Data = {'$(vMaxData)'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,0%')" },	

			moderado: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Grave', 'Leve', 'Não Informado'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#.##0')" },	
			moderado_p: { qStringExpression: " Num((Count({< [Estado de Saúde] -= {'Grave', 'Leve', 'Não Informado'}, Data = {'$(vMaxData)'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,0%')" },

			leve: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Moderado', 'Grave', 'Não Informado'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#.##0')" },	
			leve_p: { qStringExpression: "Num((Count({< [Estado de Saúde] -= {'Moderado', 'Grave', 'Não Informado'}, Data = {'$(vMaxData)'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,0%')" },	
			
			pcr: { qStringExpression: "Num(Count( { <DataChave = {'$(=Max(DataChave))'} , testeRT_PCR = {SIM} > } [Record ID]), '#.##0')" },
			pcr_p: { qStringExpression: "Num(Count( { <DataChave = {'$(=Max(DataChave))'} , testeRT_PCR = {'SIM'} > } [Record ID])/(Count( { <DataChave = {'$(=Max(DataChave))'} , testeRT_PCR = {'SIM'} > } [Record ID])+Count( { <DataChave = {'$(=Max(DataChave))'} , testeRapido = {'SIM'} > } [Record ID])),'#.##0,#%')" },
			
			rapida: { qStringExpression: "Num(Count( { <DataChave = {'$(=Max(DataChave))'} , testeRapido = {'SIM'} > } [Record ID]), '#.##0')" },
			rapida_p: { qStringExpression: "Num(Count( { <DataChave = {'$(=Max(DataChave))'} , testeRapido = {'SIM'} > } [Record ID])/(Count( { <DataChave = {'$(=Max(DataChave))'} , testeRT_PCR = {'SIM'} > } [Record ID])+Count( { <DataChave = {'$(=Max(DataChave))'} , testeRapido = {'SIM'} > } [Record ID])),'#.##0,#%')" },

		}, function ( reply ) {
			$scope.reloadTime = reply.reloadTime;
			
			$('#reloadTime').html(reply.reloadTime);
			$('#posicao').css('visibility', 'visible');

			$('#kpi-df-total-casos').html(reply.total_casos);
			$('#kpi-df-total-casos-p').html(reply.total_casos_p);
			$('#kpi-df-novos-casos').html(reply.novos_casos);
			$('#kpi-df-novos-casos-mob').html(reply.novos_casos);
			
			
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
			
			$('#kpi-df-pcr').html(reply.pcr);
			$('#kpi-df-pcr-p').html(reply.pcr_p);
			$('#info-bar-pcr').css('width', reply.pcr_p.replace(',', '.'));

			$('#kpi-df-rapida').html(reply.rapida);
			$('#kpi-df-rapida-p').html(reply.rapida_p);
			$('#info-bar-rapida').css('width', reply.rapida_p.replace(',', '.'));

		});
		
		app.createGenericObject( {
		
			ativos: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Curado', 'Óbito'}>}[Record ID]), '#.##0')" },
			ativos_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Curado', 'Óbito'}>}[Record ID]) / Count({<MesDia = {'$(vMaxMesDia)'}, AtivoInativo = {'Ativo'}>}[Record ID]), '#,0%')" },	
		
			emAnalise: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, [Estado de Saúde] -= {'Moderado', 'Leve', 'Grave'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]), '#.##0')" },	
			emAnalise_p: { qStringExpression: "Num((Count({<  [Estado de Saúde] -= {'Moderado', 'Leve', 'Grave'}, Data = {'$(vMaxData)'}, classificacaoFinal -= {'Óbito', 'Cura'}>}[Record ID]) / Count({<[Classificação final - automática], Data = {'$(vMaxData)'}, [Estado de Saúde]>}[Record ID])), '#,0%')" },	

			recuperado: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Óbito', 'Ignorado'}>}[Record ID]), '#.##0')" },	
			recuperado_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Óbito', 'Ignorado'}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal>}[Record ID]), '#.##0,#%')" },	

			obito: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Cura', 'Ignorado'}>}[Record ID]), '#.##0')" },	
			obito_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Cura', 'Ignorado'}>}[Record ID])/Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal>}[Record ID]), '#.##0,#%')" },	

			df: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, Flag_DF = {'DF'}>}[Record ID]), '#.##0')" },	
			df_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, Flag_DF = {'DF'}>}[Record ID]) / Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Cura', 'Ignorado'}>}[Record ID]), '#,0%')" },	

			outros_estados: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, Flag_DF = {'Outros Estados'}>}[Record ID]), '#.##0')" },	
			outros_estados_p: { qStringExpression: "Num(Count({<MesDia = {'$(vMaxMesDia)'}, Flag_DF = {'Outros Estados'}>}[Record ID]) / Count({<MesDia = {'$(vMaxMesDia)'}, classificacaoFinal -= {'Cura', 'Ignorado'}>}[Record ID]), '#,0%')" },
		
		}, function ( reply ) {
			$('#kpi-df-ativos').html(reply.ativos);
			$('#kpi-df-ativos-p').html(reply.ativos_p);
			$('#info-bar-ativos').css('width', reply.ativos_p.replace(',', '.'));
		
			$('#kpi-df-analise').html(reply.emAnalise);
			$('#kpi-df-analise-p').html(reply.emAnalise_p);
			$('#info-bar-ni').css('width', reply.emAnalise_p.replace(',', '.'));

			$('#kpi-df-recuperado').html(reply.recuperado);
			$('#kpi-df-recuperado-p').html(reply.recuperado_p);
			$('#info-bar-recuperado').css('width', reply.recuperado_p.replace(',', '.'));

			$('#kpi-df-obito').html(reply.obito);
			$('#kpi-df-obito-p').html(reply.obito_p);
			$('#info-bar-obito').css('width', reply.obito_p.replace(',', '.'));
			

			$('#kpi-df-df').html(reply.df);
			$('#kpi-df-df-p').html(reply.df_p == '-' ? '0,0%' : reply.df_p.replace(',', '.'));
			$('#info-bar-df').css('width', reply.df_p == '-' ? 0 : reply.df_p.replace(',', '.'));
			
			$('#kpi-df-outros-estados').html(reply.outros_estados);
			$('#kpi-df-outros-estados-p').html(reply.outros_estados_p == '-' ? '0,0%' : reply.outros_estados_p.replace(',', '.'));
			$('#info-bar-outros-estados').css('width', reply.outros_estados_p == '-' ? 0 : reply.outros_estados_p.replace(',', '.'));
			
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

		});
		
		app.createGenericObject( {
			cardio: { qStringExpression: "Num(Sum({< Cardiovasculopatia = {'Sim'},  Data = {'$(vMaxData)'} >}[Sum Comorbidades]), '#.##0')" },	
			cardio_p: { qStringExpression: "Num(Sum({< Cardiovasculopatia = {'Sim'},  Data = {'$(vMaxData)'} >}[Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			metabolico: { qStringExpression: "Num(Sum({< [Distúrbios Metabólicos] = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades]), '#.##0')" },	
			metabolico_p: { qStringExpression: "Num(Sum({< [Distúrbios Metabólicos] = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			pneumo: { qStringExpression: "Num(Sum({< Pneumopatia = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades]), '#.##0')" },	
			pneumo_p: { qStringExpression: "Num(Sum({< Pneumopatia = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			imuno: { qStringExpression: "Num(Sum({< Imunopressão = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades]), '#.##0')" },	
			imuno_p: { qStringExpression: "Num(Sum({< Imunopressão = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			nefropatia: { qStringExpression: "Num(Sum({< Nefropatia = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades]), '#.##0')" },	
			nefropatia_p: { qStringExpression: "Num(Sum({< Nefropatia = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			obesidade: { qStringExpression: "Num(Sum({< Obesidade = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades]), '#.##0')" },	
			obesidade_p: { qStringExpression: "Num(Sum({< Obesidade = {'Sim'},  Data = {'$(vMaxData)'} >} [Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			hemato: { qStringExpression: "Num(Sum({< [Doença Hematológica] = {'Sim'},  Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#.##0')" },	
			hemato_p: { qStringExpression: "Num(Sum({< [Doença Hematológica] = {'Sim'},  Data = {'$(vMaxData)'}>}[Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			c_outros: { qStringExpression: "Num(Sum({< Outros = {'Sim'},  Data = {'$(vMaxData)'}>} [Sum Comorbidades]), '#.##0')" },	
			c_outros_p: { qStringExpression: "Num(Sum({< Outros = {'Sim'},  Data = {'$(vMaxData)'}>} [Sum Comorbidades])/Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades]), '#,0%')" },
			
			comor: { qStringExpression: "Num(sum({< Data = {'$(vMaxData)'}>} [Sum Comorbidades]), '#.##0')" },	
			comor_p: { qStringExpression: "Num(Sum({< Data = {'$(vMaxData)'}>}[Sum Comorbidades])/Count({<Data = {'$(vMaxData)'}, AtivoInativo = {'Ativo'}>}[Record ID]), '#,0%')" },

	
		}, function ( reply ) {
			$('#kpi-df-cardio').html(reply.cardio);
			$('#kpi-df-cardio-p').html(reply.cardio_p);
			$('#info-bar-cardio').css('width', reply.cardio_p.replace(',', '.'));
			
			$('#kpi-df-metabolico').html(reply.metabolico);
			$('#kpi-df-metabolico-p').html(reply.metabolico_p);
			$('#info-bar-metabolico').css('width', reply.metabolico_p.replace(',', '.'));
			
			$('#kpi-df-pneumo').html(reply.pneumo);
			$('#kpi-df-pneumo-p').html(reply.pneumo_p);
			$('#info-bar-pneumo').css('width', reply.pneumo_p.replace(',', '.'));
			
			$('#kpi-df-imuno').html(reply.imuno);
			$('#kpi-df-imuno-p').html(reply.imuno_p);
			$('#info-bar-imuno').css('width', reply.imuno_p.replace(',', '.'));
			
			$('#kpi-df-nefropatia').html(reply.nefropatia);
			$('#kpi-df-nefropatia-p').html(reply.nefropatia_p);
			$('#info-bar-nefropatia').css('width', reply.nefropatia_p.replace(',', '.'));
			
			$('#kpi-df-obesidade').html(reply.obesidade);
			$('#kpi-df-obesidade-p').html(reply.obesidade_p);
			$('#info-bar-obesidade').css('width', reply.obesidade_p.replace(',', '.'));
			
			$('#kpi-df-hemato').html(reply.hemato);
			$('#kpi-df-hemato-p').html(reply.hemato_p);
			$('#info-bar-hemato').css('width', reply.hemato_p.replace(',', '.'));
			
			$('#kpi-df-c_outros').html(reply.c_outros);
			$('#kpi-df-c_outros-p').html(reply.c_outros_p);
			$('#info-bar-c_outros').css('width', reply.c_outros_p.replace(',', '.'));
			
			$('#kpi-df-comor').html(reply.comor);
			$('#kpi-df-comor-p').html(reply.comor_p);
			$('#info-bar-comor').css('width', reply.comor_p.replace(',', '.'));

		});

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
			
			
	}]);
	
	angular.bootstrap( document, ["appCovid", "qlik-angular"] );

	app = qlik.openApp('1bd822cb-ed63-42d7-a627-acfaddb20c65');
	
	qlik.theme.apply('ssp white');
});
